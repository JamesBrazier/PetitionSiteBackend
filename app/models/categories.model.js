const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");
const error = require("../middleware/error.middleware");

const nameMap = {
    "categoryId": "category_id"
}

exports.exists = async function(id)
{
    const connection = await db.getConnection();

    let [[value], _] = await connection.query(
        "SELECT category_id \
        FROM Category \
        WHERE category_id = ?",
        id
    );

    connection.release();
    return value != null;
}

/**
 * @description returns the category with the given id
 * @param {Number} id the category id
 * @returns the category details
 */
exports.get = async function(queryVal, queryField="categoryId", fields=["categoryId", "name"]) 
{
    const connection = await db.getConnection();

    let [[value], _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Category \
        WHERE " + helper.mapName(queryField, nameMap) + " = ?", 
        queryVal
    );

    connection.release();
    return value;
}

/**
 * @description returns all the categories in the database
 * @returns a list of the categories
 */
exports.getAll = async function(fields=["categoryId", "name"])
{
    const connection = await db.getConnection();

    let [values, _] = await connection.query(
        helper.genSelect(fields, nameMap) + 
        "FROM Category"
    );

    connection.release();
    return values;
}