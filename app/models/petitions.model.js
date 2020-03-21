const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");
const error = require("../middleware/error.middleware");

const nameMap = {
    "authorId": "author_id",
    "authorName": "User.name",
    "authorCity": "User.city",
    "authorCountry": "User.country",
    "authorPhoto": "User.photo_filename",
    "categoryId": "Petition.category_id",
    "category": "Category.name",
    "closingDate": "closing_date",
    "createdDate": "created_date",
    "petitionId": "Petition.petition_id",
    "photoFilename": "Petition.photo_filename",
    "signatureCount": "COUNT(signatory_id)",
    "signatures": "COUNT(signatory_id)"
}

exports.exists = async function(id)
{
    const connection = await db.getConnection();

    let [[value], _] = await connection.query(
        "SELECT petition_id \
        FROM Petition \
        WHERE petition_id = ?", 
        id
    );

    connection.release();
    return value != null;
}

/**
 * @description returns the petition with the given id
 * @param {Number} id the petition id
 * @returns the petition's details
 */
exports.get = async function(queryVal, queryField="petitionId", 
    fields=["petitionId", "title", "category", "authorId", "signatures"])
{
    const connection = await db.getConnection();

    let [[value], _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Petition \
            LEFT JOIN Signature \
            ON Petition.petition_id = Signature.petition_id \
            JOIN Category \
            ON Petition.category_id = Category.category_id \
            JOIN User \
            ON Petition.author_id = User.user_id \
        WHERE " + helper.mapName(queryField, nameMap) + " = ? \
        GROUP BY Petition.petition_id", 
        queryVal
    );

    connection.release();
    return value;
}

/**
 * @description returns all the petitions is the database
 * @returns a list of the petitions
 */
exports.getAll = async function(fields=["petitionId", "title", "category", "authorId", "signatures"])
{
    const connection = await db.getConnection();

    let [values, _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Petition \
            LEFT JOIN Signature \
            ON Petition.petition_id = Signature.petition_id \
            JOIN Category \
            ON Petition.category_id = Category.category_id \
            JOIN User \
            ON Petition.author_id = User.user_id \
        GROUP BY Petition.petition_id \
        ORDER BY COUNT(signatory_id) DESC"
    );

    connection.release();
    return values;
}

/**
 * @description searches the petitions in the databse and returns those which fit the search params
 * @param {object} params the query parameters with the given possible fields
 * @param {Number} params.startIndex the number of items to skip before returning results
 * @param {Number} params.count the number of items to include in result
 * @param {String} params.q include only items that include this in their title
 * @param {Number} params.categoryId include only items that have this category
 * @param {Number} params.authorId include only items authored by the given user id
 * @param {String} params.sortBy sort returned items in the given way 
 * (values are: ALPHABETICAL_ASC, ALPHABETICAL_DESC, SIGNATURES_ASC, SIGNATURES_DESC)
 * @returns the items that match the given parameters
 */
exports.search = async function(params={}, 
    fields=["petitionId", "title", "category", "authorId", "signatures"])
{
    let queryStr = helper.genSelect(fields, nameMap) +
                   "FROM Petition \
                        LEFT JOIN Signature \
                        ON Petition.petition_id = Signature.petition_id \
                        JOIN Category \
                        ON Petition.category_id = Category.category_id \
                        JOIN User \
                        ON Petition.author_id = User.user_id"
    let queryArgs = [];

    queryStr += " WHERE"
    if (params.q !== undefined) {
        queryStr += " title LIKE ?";
        queryArgs.push('%' + params.q + '%');
    } else {
        queryStr += " true";
    }

    queryStr += " AND"
    if (params.categoryId !== undefined) {
        queryStr += " Petition.category_id = ?";
        queryArgs.push(params.categoryId);
    } else {
        queryStr += " true";
    }

    queryStr += " AND"
    if (params.authorId !== undefined) {
        queryStr += " author_id = ?";
        queryArgs.push(params.authorId);
    } else {
        queryStr += " true";
    }

    queryStr += " GROUP BY Petition.petition_id";
    switch (params.sortBy) {
        case undefined:
        case "SIGNATURES_DESC":
            queryStr += " ORDER BY COUNT(signatory_id) DESC";
            break;
        case "SIGNATURES_ASC":
            queryStr += " ORDER BY COUNT(signatory_id) ASC";
            break;
        case "ALPHABETICAL_ASC":
            queryStr += " ORDER BY title ASC";
            break;
        case "ALPHABETICAL_DESC":
            queryStr += " ORDER BY title DESC";
            break;
        default:
            throw new error.BadRequest("Sorting enum is not valid");
    }

    if (params.count != null) {
        if (params.startIndex != null) {
            queryStr += " LIMIT ?, ?"
            queryArgs.push(params.startIndex, params.count);
        } else {
            queryStr += " LIMIT ?";
            queryArgs.push(params.count);
        }
    } else if (params.startIndex != null) {
        queryStr += " LIMIT ?, ?"
        queryArgs.push(params.startIndex, Number.MAX_SAFE_INTEGER);
    }

    const connection = await db.getConnection();

    let [values, _] = await connection.query(queryStr, queryArgs);

    connection.release();
    return values;
}

/**
 * @description adds a new petition to the database
 * @param {object} values an object with the given possible fields
 * @param {String} values.title the title of the petition (required)
 * @param {String} values.description the description of the petition (required)
 * @param {Number} values.authorId the id of the user who created the petition (required)
 * @param {Number} values.categoryId the id of the category this belongs to (required)
 * @param {Date} values.closingDate the date this petition will end (optional)
 * @param {Date} values.createdDate the current date (required)
 * @param {String} values.photoFilename the path to the hero image for the petition (optional)
 * @returns details about the addition
 */
exports.add = async function(values)
{
    const connection = await db.getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Petition \
        SET ?",
        helper.mapObject(values, nameMap)
    );

    connection.release();
    return value;
}

/**
 * @description removes the petition with the given id, deleting all signatures too
 * @param {Number} id the petition id
 * @returns details about the deletion
 */
exports.delete = async function(id)
{
    const connection = await db.getConnection();

    let [value, _] = await connection.query(
        "DELETE FROM Petition \
        WHERE petition_id = ?", 
        id
    );

    connection.release();
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
    const connection = await db.getConnection();

    let [value, _] = await connection.query(
        "UPDATE Petition SET ? \
        WHERE petition_id = ?",
        [
            helper.mapObject(values, nameMap), 
            id
        ]
    );

    connection.release();
    return value;
}
