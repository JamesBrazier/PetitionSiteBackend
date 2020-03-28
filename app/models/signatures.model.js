const db = require("../../config/db");
const helper = require("../middleware/sql.middleware");

const nameMap = {
    "petitionId": "petition_id",
    "userId": "signatory_id",
    "name": "User.name",
    "city": "User.city",
    "country": "User.country",
    "signatoryId": "signatory_id",
    "signedDate": "signed_date"
}

/**
 * @description returns true if a signature for the given petition with the given signatory exists
 * @param {Number} id the id of the petition to check
 * @param {Number} userId the id of the user to check
 * @returns {Boolean} true if the signature exists
 */
exports.exists = async function(id, userId)
{
    const connection = await db.getConnection();

    try {
        let [[value], _] = await connection.query(
            "SELECT signed_date \
            FROM Signature \
            WHERE petition_id = ? \
                AND signatory_id = ?",
            [ id, userId ]
        );

        connection.release();
        return value != null;
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description returns the signature(s) with the given value as the query field
 * @param queryVal the value to query
 * @param {String} queryField the field to query
 * @param {Array<String>} fields the fields to return
 * @returns {Array<Object>} the signtures fields
 */
exports.get = async function(queryVal, queryField="petitionId", fields=["petitionId", "userId"])
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
            helper.genSelect(fields, nameMap) + //create a select statement from the given fields
            "FROM Signature \
                JOIN User \
                ON signatory_id = user_id \
            WHERE " + helper.mapName(queryField, nameMap) + " = ? \
            ORDER BY signed_Date ASC", 
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
 * @description add the given users signature to the petition
 * @param {Number} petitionId the id of the petition
 * @param {Number} userId the id of the user
 * @param {Date} date the date of the signing
 * @returns {Object} details of the addition
 */
exports.add = async function(petitionId, userId, date) 
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
            "INSERT INTO Signature \
            SET ?", 
            {
                petition_id: petitionId,
                signatory_id: userId,
                signed_date: date
            }
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
}

/**
 * @description deletes the given users signature off the given petition
 * @param {Number} petitionId the id of the petition
 * @param {Number} userId the id of the user to remove
 * @returns {Object} details of the deletion
 */
exports.delete = async function(petitionId, userId)
{
    const connection = await db.getConnection();

    try {
        let [value, _] = await connection.query(
            "DELETE FROM Signature \
            WHERE petition_id = ? \
                AND signatory_id = ?", 
            [
                petitionId, 
                userId
            ]
        );

        connection.release();
        return value;
    } catch (err) {
        connection.release();
        throw err;
    }
}