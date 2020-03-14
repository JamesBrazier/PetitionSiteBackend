const db = require("../../config/db");

/**
 * @description returns the user with the given id
 * @param {Number} id the user id
 * @returns the user details
 */
exports.get = async function(id) 
{
    const connection = await db.getPool().getConnection();

    let [[value], _] = await connection.query(
        "SELECT * FROM User WHERE user_id = ?", 
        id
    );

    return value;
}

/**
 * @description returns all the users in the database
 * @returns a list of all the users
 */
exports.getAll = async function() 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query("SELECT * FROM User");

    return value;
}

/**
 * @description returns the given fields from the given user
 * @deprecated this doesn't work right now
 */
exports.getFields = async function(id, fields) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "SELECT ? FROM User WHERE user_id = ?", 
        [fields, id]
    );

    return value;
}

/**
 * @description adds a new user with the given fields
 * @param {object} values an object wth the given possible values
 * @param {String} values.name the user name (required)
 * @param {String} values.email the user email (required)
 * @param {String} values.password the user password (required)
 * @param {String} values.city the user home city (optional)
 * @param {String} values.country the users home country (optional)
 * @return details about the addition
 */
exports.add = async function(values) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO User SET ?", 
        values
    );

    return value;
}

/**
 * @description updates the user with the given id with the given fields
 * @param {Number} id the user id
 * @param {object} values an object wth the given optional values
 * @param {String} values.name the user name
 * @param {String} values.email the user email
 * @param {String} values.password the user password
 * @param {String} values.city the user home city
 * @param {String} values.country the users home country
 * @return details about the change
 */
exports.update = async function(id, values) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "UPDATE User SET ? WHERE user_id = ?", 
        [values, id]
    );

    return value;
}