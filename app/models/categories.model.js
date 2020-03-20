const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");
const error = require("../middleware/error.middleware");

const nameMap = {
    "categoryId": "category_id"
}

/**
 * @description returns the category with the given id
 * @param {Number} id the category id
 * @returns the category details
 */
exports.get = async function(queryVal, queryField="categoryId", fields=["categoryId", "name"]) 
{
    const connection = await db.getConnection();

    let [[value], _] = await db.query(connection,
        helper.genSelect(fields, nameMap) +
        "FROM Category \
        WHERE " + helper.mapName(queryField, nameMap) + " = ?", 
        queryVal
    );

    connection.release();

    if (value == null) {
        throw new error.NotFound(`no category with given ${queryField} was found`);
    }
    return value;
}

/**
 * @description returns all the categories in the database
 * @returns a list of the categories
 */
exports.getAll = async function(fields=["categoryId", "name"])
{
    const connection = await db.getConnection();

    let [values, _] = await db.query(connection,
        helper.genSelect(fields, nameMap) + 
        "FROM Category"
    );

    connection.release();
    return values;
}