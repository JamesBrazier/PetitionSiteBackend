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

exports.mapName = function(name, nameMap) 
{
    if (nameMap[name] != undefined) {
        return nameMap[name];
    } else {
        return name;
    }
}

exports.genSetNull = function(fields, nameMap={})
{
    function get(i) {
        if (nameMap[fields[i]] != undefined) {
            return nameMap[fields[i]];
        } else {
            return fields[i];
        }
    }

    let query = "SET ";

    query += get(0) + " = NULL";
    for (let i = 1; i < fields.length; ++i) {
        query += ", " + get(i) + " = NULL";
    }

    return query + '\n';
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

// function aliasField(str, aliasMap={})
// {
//     if (aliasMap[str] != null) {
//         return aliasMap[str] + " AS " + str;
//     } else {
//         return str;
//     }
// }

// String.prototype.equals = function(number)
// {
//     number = Number(number);

//     return this + " = " + number;
// }

// String.prototype.lessThan = function(number)
// {
//     number = Number(number);

//     return this + " < " + number;
// }

// String.prototype.moreThan = function(number)
// {
//     number = Number(number);

//     return this + " > " + number;
// }

// String.prototype.lessThanEqual = function(number)
// {
//     number = Number(number);

//     return this + " <= " + number;
// }

// String.prototype.moreThanEqual = function(number)
// {
//     number = Number(number);

//     return this + " >= " + number;
// }

// String.prototype.between = function(a, b)
// {
//     a = Number(a);
//     b = Number(b);

//     return this + " BETWEEN " + a + " AND " + b;
// }

// String.prototype.and = function(table) 
// {
//     return this + " AND " + table;
// }

// String.prototype.or = function(table)
// {
//     return this + " OR " + table;
// }

// String.prototype.openBrace = function() 
// {
//     return this + " (";
// }

// String.prototype.closeBrace = function()
// {
//     return this + ") ";
// }

// exports.Table = class Table 
// {
//     connection;
//     name;
//     aliasMap;
//     joinDef;
//     key;

//     constructor(name, key, joinDef)
//     {
//         let aliasMap = {};
//         for (let key in this) {
//             aliasMap[this[key]] = key;
//         }

//         this.aliasMap = aliasMap;
//         this.name = name;
//         this.joinDef = joinDef;
//         this.key = key;
//     }

//     query(fields, clause=undefined, sort=undefined, 
//         order=undefined, limit=undefined, start=undefined)
//     {
//         this.joinQuery(fields, undefined, clause, sort, order, limit, start);
//     }

//     joinQuery(fields, join=undefined, clause=undefined, sort=undefined, 
//         order=undefined, limit=undefined, start=undefined)
//     {
//         let query = "SELECT ";

//         query += aliasField(fields[0], this.aliasMap);
//         for (let i = 1; i < fields.length; ++i) {
//             query += ", " + aliasField(fields[i], this.aliasMap);
//         }
//         query += '\n';    

//         query += "FROM " + this.name + '\n';

//         if (join != null) {
//             for (const table of join) {
//                 query += "    JOIN " + table.name + '\n';
//                 query += "    ON " + this.joinDef[table.name] + '\n';
//             }
//             if (clause != null) {
//                 query += "WHERE " + clause + '\n';
//             }
//             query += "GROUP BY " + this.key + '\n';
//         } else {
//             if (clause != null) {
//                 query += "WHERE " + clause + '\n';
//             }
//         }

//         if (sort != null) {
//             query += "ORDER BY " + sort;
//             if (order != null) {
//                 query += " " + order;
//             }
//             query += '\n';
//         }

//         if (limit != null && Number(limit) != NaN) {
//             if (start != null && Number(start) != NaN) {
//                 query += "LIMIT " + start + ", " + limit + '\n';
//             } else {
//                 query += "LIMIT " + limit + '\n';
//             }
//         }

//         const connection = db.getConnection();

//         let [values, _] = db.query(this.connection, query);

//         connection.release();
//         return values;
//     }

//     insert(values) 
//     {
//         const connection = db.getConnection();

//         let [info, _] = db.query(this.connection,
//             "INSERT INTO " + this.name + "SET ?", 
//             helper.mapObject(values, this.aliasMap)
//         );

//         connection.release();
//         return info;
//     }

//     update(values, clause=undefined)
//     {
//         const connection = db.getConnection();

//         let [info, _] = db.query(this.connection,
//             "UPDATE " + this.name + " SET ? WHERE " + clause,
//             helper.mapObject(values, this.aliasMap)
//         );

//         connection.release();
//         return info;
//     }

//     delete(clause) 
//     {
//         const connection = db.getConnection();

//         let [info, _] = db.query(connection,
//             "DELETE FROM " + this.name + " WHERE " + clause
//         );

//         connection.release();
//         return info;
//     }

//     clear(fields, clause)
//     {
//         let query = "UPDATE " + this.name + "SET ";

//         query += fields[0] + " = NULL";
//         for (let i = 1; i < fields.length; ++i) {
//             query += ", " + fields[i] + " = NULL";
//         }

//         query += " WHERE " + clause;

//         const connection = db.getConnection();

//         let [info, _] = db.query(this.connection,
//             query,
//             helper.mapObject(values, this.aliasMap)
//         );

//         connection.release();
//         return info;
//     }
// }

// module.exports = class Signature extends helper.Table
// {
//     petitionId = "Signature.petition_id";
//     signatoryId = "Signature.signatory_id";
//     signedDate = "Signature.signed_date";

//     constructor()
//     {
//         super("Siganture", "Signature.signatory_id", {
//             "Petition": "Petition.petition_id = Signature.petition_id",
//             "User": "User.user_id = Signature.signatory_id"
//         });
//     }
// }