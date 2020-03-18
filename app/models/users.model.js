const db = require("../../config/db");
const helper = require("./helper.model");

const nameMap = {
    "userId": "user_id",
    "photoFilename": "photo_filename",
    "token": "auth_token"
}

/**
 * @description returns the user with the given id
 * @param {Number} id the user id
 * @returns the user details
 */
exports.get = async function(queryVal, queryField="userId", 
    fields=["userId", "name", "city", "country", "email"]) 
{
    const connection = await db.getConnection();

    let [[value], _] = await db.query(connection,
        helper.genSelect(fields, nameMap) +
        "FROM User \
        WHERE " + helper.mapName(queryField, nameMap) + " = ?", 
        queryVal
    );

    connection.release();
    return value;
}

/**
 * @description returns all the users in the database
 * @returns a list of all the users
 */
exports.getAll = async function(fields=["userId", "name", "city", "country", "email"]) 
{
    const connection = await db.getConnection();

    let [value, _] = await db.query(connection,
        helper.genSelect(fields, nameMap) + 
        "FROM User"
    );

    return value;
}

/**
 * @description adds a new user with the given fields
 * @param {object} values an object wth the given possible values
 * @param {String} values.name the user name (required)
 * @param {String} values.email the user email (required)
 * @param {Number} values.password the user password (required)
 * @param {String} values.city the user home city (optional)
 * @param {String} values.country the users home country (optional)
 * @return details about the addition
 */
exports.add = async function(values) 
{
    const connection = await db.getConnection();

    let [value, _] = await db.query(connection,
        "INSERT INTO User \
        SET ?", 
        [values]
    );

    connection.release();
    return value;
}

/**
 * @description updates the user with the given id with the given fields
 * @param {Number} id the user id
 * @param {object} values an object wth the given optional values
 * @param {String} values.name the user name
 * @param {String} values.email the user email
 * @param {Number} values.password the user password
 * @param {String} values.city the user home city
 * @param {String} values.country the users home country
 * @param {Number} values.token the users auth token
 * @return details about the change
 */
exports.update = async function(id, values) 
{
    const connection = await db.getConnection();

    let [value, _] = await db.query(connection,
        "UPDATE User \
        SET ? \
        WHERE user_id = ?", 
        [
            helper.mapObject(values, nameMap),
            id
        ]
    );

    connection.release();
    return value;
}

exports.clearFields = async function(id, fields)
{
    const connection = await db.getConnection();

    let [value, _] = await db.query(connection, 
        "UPDATE User "
        + helper.genSetNull(fields, nameMap) +
        "WHERE user_id = ?",
        id
    );

    connection.release();
    return value;
}