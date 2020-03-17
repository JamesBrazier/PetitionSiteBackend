const db = require("../../config/db");
const error = require("../controllers/error.controller")

/**
 * @description generates a select statement from the given fields and alias map
 * @param {Array<String>} fields the list of field names
 * @param {object} nameMap the field name alias map
 */
exports.genSelect = function(fields, nameMap={}) 
{
    function get(i) {
        if (nameMap[fields[i]] != undefined) {
            return nameMap[fields[i]] + " AS " + fields[i];
        } else {
            return fields[i];
        }
    }

    let query;

    query = "SELECT " + get(0);

    for (let i = 1; i < fields.length; ++i) {
        query += ", " + get(i);
    }

    return query + '\n';
}

/**
 * @description creates a SQL query from the given parameters
 * @param {String} table the name of the table to query
 * @param {object} params the other optional parameters
 * @param {Array<String>} params.fields the fields to return
 * @param {Array<Array<String>>} params.join list of tables to join to, each join is a list of the join table, 
 * join table column, and table column
 * @param {String} params.clause the clause string to filter items, use ? for arguments
 * @param {String} params.sort the column to sort by, add ASC or DESC for order
 * @param {Number} params.count the number of elements to return
 * @param {Number} params.startIndex the starting index of elements to return
 * @param {object} nameMap the field name alias map
 * @returns the string query
 */
exports.genQuery = function(table, params=undefined, nameMap={}) 
{
    let query;

    if (params.fields != null) {
        query = genSelect(params.fields, nameMap);
    } else {
        query = "SELECT *\n";
    }

    query += "FROM " + table + '\n';

    if (params != null) {
        if (params.join != null) {
            for (const join of params.join) {
                query += "\tJOIN " + join[0];
                query += "\n\tON " + table + '.' + join[1] + " = " + join[0] + '.' + join[2] + '\n';
            }
            if (params.clause != null) {
                query += "WHERE " + params.clause + '\n';
            }
            query += "GROUP BY " + table + '.' + params.join[0][1];
            for (let i = 1; i < params.join.length; ++i) {
                query += ", " + table + '.' + params.join[i][1];
            }
            query += '\n';
        } else {
            if (params.clause != null) {
                query += "WHERE " + params.clause + '\n';
            }
        }

        if (params.sort != null) {
            query += "ORDER BY " + params.sort + '\n';
        }

        if (params.count != null && Number(params.count) != NaN) {
            if (params.startIndex != null && Number(params.startIndex) != NaN) {
                query += "LIMIT " + params.startIndex + ", " + params.count + '\n';
            } else {
                query += "LIMIT " + params.count + '\n';
            }
        }
    }

    return query;
}

/**
 * @description creates a SQL query sends it to the db and returns requested
 * @param {String} table the name of the table to query
 * @param {object} params the other optional parameters
 * @param {Array<String>} params.fields the fields to return
 * @param {Array<Array<String>>} params.join list of tables to join to, each join is a list 
 *                               of the join table, join table column, and table column
 * @param {String} params.clause the clause string to filter items, use ? for arguments
 * @param {String} params.sort the column to sort by, add ASC or DESC for order
 * @param {Number} params.count the number of elements to return
 * @param {Number} params.startIndex the starting index of elements to return
 * @param {Array} values the params to insert into the query after checking for safety
 * @returns the string query
 */
exports.query = async function(table, params=undefined, values=undefined)
{
    try {
        var connection = await db.getPool().getConnection();
    } catch (err) { 
        throw error.InternalError(err.message); 
    }

    try{
        var [response, _] = await connection.query(genQuery(table, params), values);
    } catch (err) { 
        throw error.BadRequest(err.message); 
    }

    if (params.count != null && params.count === 1) {
        return response[0];
    } else {
        return response;
    }
}

/**
 * @description creates a new object where the fields with the aliases in the map are resplaced
 * @param {object} obj the object to map
 * @param {object} nameMap the field name alias map
 */
exports.mapObject = function(obj, nameMap={}) 
{
    for (let field in obj) {
        if (nameMap[field] != null) {
            obj[nameMap[field]] = obj[field];
            delete obj[field];
        }
    }

    return obj;
}