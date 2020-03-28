const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");
const error = require("../middleware/error.middleware");

const nameMap = {
    "categoryId": "category_id"
}

/**
 * @description returns true if a category with the given id exists
 * @param {Number} id the id to check
 * @returns {Boolean} true if the category exists
 */
exports.exists = async function(id)
{
    const connection = await db.getConnection();

    try {
        let [[value], _] = await connection.query(
            "SELECT category_id \
            FROM Category \
            WHERE category_id = ?",
            id
        );

        connection.release();
        return value != null;
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description returns the category with the given value as the query field
 * @param queryVal the unique value to query
 * @param {String} queryField the field to query
 * @param {Array<String>} fields the fields to return
 * @returns {Object} the category fields
 */
exports.get = async function(queryVal, queryField="categoryId", fields=["categoryId", "name"]) 
{
    const connection = await db.getConnection();

    try {
        let [[value], _] = await connection.query(
            helper.genSelect(fields, nameMap) + //create a select statement from the given fields
            "FROM Category \
            WHERE " + helper.mapName(queryField, nameMap) + " = ?", 
            queryVal
        );

        connection.release();
        return value;
    } catch (err) { //if an error occurs we still need to release the connection
        connection.release();
        throw err;
    }
}

/**
 * @description returns all the categories in the database
 * @param {Array<String>} fields the fields to return
 * @returns {Array<Object>} a list of the categories fields
 */
exports.getAll = async function(fields=["categoryId", "name"])
{
    const connection = await db.getConnection();

    try {
        let [values, _] = await connection.query(
            helper.genSelect(fields, nameMap) + 
            "FROM Category"
        );

        connection.release();
        return values;
    } catch (err) {
        connection.release();
        throw err;
    }
}