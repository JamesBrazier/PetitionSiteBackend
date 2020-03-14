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
        "SELECT Petition.petition_id, title, description, author_id, category_id, \
            created_date, closing_date, Petition.photo_filename, COUNT(signatory_id) AS signatures \
        FROM Petition \
            LEFT JOIN Signature \
            ON Petition.petition_id = Signature.petition_id \
        WHERE Petition.petition_id = ? \
        GROUP BY Petition.petition_id", 
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

    let [values, _] = await connection.query(
        "SELECT Petition.petition_id, title, description, author_id, category_id, \
            created_date, closing_date, Petition.photo_filename, COUNT(signatory_id) AS signatures \
        FROM Petition \
            LEFT JOIN Signature \
            ON Petition.petition_id = Signature.petition_id \
        GROUP BY Petition.petition_id"
    );

    return values;
}

/**
 * @description searches the petitions in the databse and returns those which fit the search params
 * @param {object} params the query parameters with the given possible fields
 * @param {Number} params.start_index the number of items to skip before returning results
 * @param {Number} params.count the number of items to include in result
 * @param {String} params.query include only items that include this in their title
 * @param {Number} params.category_id include only items that have this category
 * @param {Number} params.author_id include only items authored by the given user id
 * @param {String} params.sort_by sort returned items in the given way 
 * (values are: ALPHABETICAL_ASC, ALPHABETICAL_DESC, SIGNATURES_ASC, SIGNATURES_DESC)
 * @returns the items that match the given parameters
 */
exports.search = async function(params)
{
    let queryStr = "SELECT Petition.petition_id, title, description, author_id, category_id, \
                        created_date, closing_date, Petition.photo_filename, COUNT(signatory_id) AS signatures \
                    FROM Petition \
                        LEFT JOIN Signature \
                        ON Petition.petition_id = Signature.petition_id";
    let queryArgs = [];

    queryStr += " WHERE"
    if (params.query !== undefined) {
        queryStr += " title LIKE ?";
        queryArgs.push('%' + params.query + '%');
    } else {
        queryStr += " true";
    }

    queryStr += " AND"
    if (params.category_id !== undefined) {
        queryStr += " category_id = ?";
        queryArgs.push(params.category_id);
    } else {
        queryStr += " true";
    }

    queryStr += " AND"
    if (params.author_id !== undefined) {
        queryStr += " author_id = ?";
        queryArgs.push(params.author_id);
    } else {
        queryStr += " true";
    }

    queryStr += " GROUP BY Petition.petition_id";
    switch (params.sort_by) {
        case "SIGNATURES_ASC":
            queryStr += " ORDER BY signatures ASC";
            break;
        case "ALPHABETICAL_ASC":
            queryStr += " ORDER BY title ASC";
            break;
        case "ALPHABETICAL_DESC":
            queryStr += " ORDER BY title DESC";
            break;
        default:
            queryStr += " ORDER BY signatures DESC";
            break;
    }

    if (params.count !== undefined) {
        if (params.start_index !== undefined) {
            queryStr += " LIMIT ?, ?"
            queryArgs.push(params.start_index, params.count);
        } else {
            queryStr += " LIMIT ?";
            queryArgs.push(params.count);
        }
    }

    const connection = await db.getPool().getConnection();

    let [values, _] = await connection.query(queryStr, queryArgs);

    return values;
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
