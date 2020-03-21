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

exports.exists = async function(id, userId)
{
    const connection = await db.getConnection();

    let [[value], _] = await connection.query(
        "SELECT signed_date \
        FROM Signature \
        WHERE petition_id = ? \
            AND signatory_id = ?",
        [ id, userId ]
    );

    connection.release();
    return value != null;
}

/**
 * @description returns all of the signatures associated with the given petition
 * @param {Number} petID the id of the Petition
 * @returns a list of the signatures the petition has
 */
exports.get = async function(queryVal, queryField="petitionId", fields=["petitionId", "userId"])
{
    const connection = await db.getConnection();

    let [value, _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Signature \
            JOIN User \
            ON signatory_id = user_id \
        WHERE " + helper.mapName(queryField, nameMap) + " = ? \
        ORDER BY signed_Date ASC", 
        queryVal
    );

    connection.release();
    return value;
}

/**
 * @description add the given users signature to the petition
 * @param {Number} petitionId the id of the petition
 * @param {Number} userId the id of the user
 * @returns details of the addition
 */
exports.add = async function(petitionId, userId, date) 
{
    const connection = await db.getConnection();

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
}

/**
 * @description deletes the given users signature off the given petition
 * @param {Number} petitionId the id of the petition
 * @param {Number} userId the id of the user to remove
 * @returns details of the deletion
 */
exports.delete = async function(petitionId, userId)
{
    const connection = await db.getConnection();

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
}