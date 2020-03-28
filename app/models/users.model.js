const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");
const error = require("../middleware/error.middleware")

const nameMap = {
    "userId": "user_id",
    "photoFilename": "photo_filename",
    "token": "auth_token"
}

/**
 * @description returns true if a user with the given id exsits
 * @param {Number} id the id of the user to check
 * @returns {Boolean} true if the user exists
 */
exports.exists = async function(id)
{
    const connection = await db.getConnection();

    try {
        let [[value], _] = await connection.query(
            "SELECT user_id \
            FROM User \
            WHERE user_id = ?", 
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
 * @description returns the user with the given value as the query field
 * @param queryVal the unique value to query
 * @param {String} queryField the field to query
 * @param {Array<String>} fields the fields to return
 * @returns {Object} the user fields
 */
exports.get = async function(queryVal, queryField="userId", 
    fields=["userId", "name", "city", "country", "email"]) 
{
    const connection = await db.getConnection();

    try {
        let [[value], _] = await connection.query(
            helper.genSelect(fields, nameMap) +
            "FROM User \
            WHERE " + helper.mapName(queryField, nameMap) + " = ?", 
            queryVal
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description returns the user with the given token
 * @param {String} queryField the token to query
 * @param {Array<String>} fields the fields to return
 * @throws error.Unauthorized if the token doesn't belong to any user
 * @returns {Object} the user fields
 */
exports.getAuth = async function(token, fields=["userId"])
{    
    const connection = await db.getConnection();

    try {
        var [[user], _] = await connection.query(
            helper.genSelect(fields, nameMap) +
            "From User \
            Where auth_token = ?",
            token
        );
        
        connection.release();
    } catch (err) {
        connection.release();
        throw err;
    }

    if (user == null) {
        throw new error.Unauthorized("given token doesn't belong to an authorized user");
    }

    return user;
}

/**
 * @description returns all the users in the database
 * @param {Array<String>} fields the fields to return
 * @returns {Array<Object>} a list of all the users fields
 */
exports.getAll = async function(fields=["userId", "name", "city", "country", "email"]) 
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
            helper.genSelect(fields, nameMap) + 
            "FROM User"
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description adds a new user with the given fields
 * @param {object} values an object wth the given possible values
 * @param {String} values.name the user name (required)
 * @param {String} values.email the user email (required)
 * @param {Number} values.password the user password (required)
 * @param {String} values.city the user home city (optional)
 * @param {String} values.country the users home country (optional)
 * @return {Object} details about the addition
 */
exports.add = async function(values) 
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
            "INSERT INTO User \
            SET ?", 
            [values]
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
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
 * @return {Object} details about the change
 */
exports.update = async function(id, values) 
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
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
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description sets the given fields for the user to NULL
 * @param {Number} id the user id
 * @param {Array<String>} the fields to set to NULL
 * @return {Object} details about the change
 */
exports.clearFields = async function(id, fields=[])
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query( 
            "UPDATE User "
            + helper.genSetNull(fields, nameMap) + //creates a list of fields to set to NULL
            "WHERE user_id = ?",
            id
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
}