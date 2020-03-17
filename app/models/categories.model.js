const db = require("../../config/db");
const helper = require("./helper.model")

const nameMap = {
    "categoryId": "category_id"
}

/**
 * @description returns the category with the given id
 * @param {Number} id the category id
 * @returns the category details
 */
exports.get = async function(id, fields=["categoryId", "name"]) 
{
    const connection = await db.getPool().getConnection();

    let [[value], _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Category \
        WHERE category_id = ?", 
        id
    );

    return value;
}

/**
 * @description returns all the categories in the database
 * @returns a list of the categories
 */
exports.getAll = async function(fields=["categoryId", "name"])
{
    const connection = await db.getPool().getConnection();

    let [values, _] = await connection.query(
        helper.genSelect(fields, nameMap) + 
        "FROM Category"
    );

    return values;
}