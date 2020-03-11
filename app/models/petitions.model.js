const db = require("../../config/db");

/**
 * @description returns the petition with the given id
 * @param {Number} id the petition id
 * @returns the petition's details
 */
exports.get = async function(id)
{
    const connection = await db.getPool().getConnection();

    let [[value], _] = await connection.query(
        "SELECT * FROM Petition WHERE petition_id = ?", 
        id
    );

    return value;
}

/**
 * @description returns all the petitions is the database
 * @returns a list of the petitions
 */
exports.getAll = async function()
{
    const connection = await db.getPool().getConnection();

    let [values, _] = await connection.query("SELECT * FROM Petition");

    return values;
}

/**
 * @description returns the given fields from the given petition
 * @deprecated this currently does not work
 */
exports.getFields = async function(id, fields) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "SELECT ? FROM Petition WHERE petition_id = ?",
        [fields, id]
    );

    return value;
}

/**
 * @deprecated this is not implemented
 */
exports.search = async function(params)
{
    throw new Error("Not implemented yet");
}

/**
 * @description adds a new petition to the database
 * @param {object} values an object with the given possible fields
 * @param {String} values.title the title of the petition (required)
 * @param {String} values.description the description of the petition (required)
 * @param {Number} values.author_id the id of the user who created the petition (required)
 * @param {Number} values.category_id the id of the category this belongs to (required)
 * @param {Date} values.closing_date the date this petition will end (optional)
 * @param {String} values.photo_filename the path to the hero image for the petition (optional)
 * @returns details about the addition
 */
exports.add = async function(values)
{
    values.created_date = new Date();

    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Petition SET ?",
        values
    );

    return value;
}

/**
 * @description removes the petition with the given id, deleting all signatures too
 * @param {Number} id the petition id
 * @returns details about the deletion
 */
exports.delete = async function(id)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "DELETE FROM Petition WHERE petition_id = ?", 
        id
    );

    return value;
}

/**
 * @description updates the details of a petition
 * @param {Number} id the petition id
 * @param {object} values an object with the given optional fields
 * @param {String} values.title the title of the petition (required)
 * @param {String} values.description the description of the petition (required)
 * @param {Number} values.author_id the id of the user who created the petition (required)
 * @param {Number} values.category_id the id of the category this belongs to (required)
 * @param {Date} values.closing_date the date this petition will end (optional)
 * @param {String} values.photo_filename the path to the hero image for the petition (optional)
 * @returns details about the change
 */
exports.update = async function(id, values)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "UPDATE Petition SET ? WHERE petition_id = ?",
        [values, id]
    );

    return value;
}
