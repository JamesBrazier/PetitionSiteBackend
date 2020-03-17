const db = require("../../config/db");
const helper = require("./helper.model")

const nameMap = {
    "petitionId": "petition_id",
    "userId": "signatory_id",
    "signatoryId": "signatory_id" 
}

/**
 * @description returns all of the signatures associated with the given petition
 * @param {Number} petID the id of the Petition
 * @returns a list of the signatures the petition has
 */
exports.get = async function(petitionId, fields=["petitionId", "userId"])
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        helper.genSelect(fields, nameMap) +
        "FROM Signature \
        WHERE petition_id = ?", 
        petitionId
    );

    return value;
}

/**
 * @description add the given users signature to the petition
 * @param {Number} petitionId the id of the petition
 * @param {Number} userId the id of the user
 * @returns details of the addition
 */
exports.add = async function(petitionId, userId) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Signature \
        SET ?", 
        {
            petition_id: petitionId,
            signatory_id: userId,
            signed_date: new Date()
        }
    );

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
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "DELETE FROM Signature \
        WHERE petition_id = ? \
            AND signatory_id = ?", 
        [
            petitionId, 
            userId
        ]
    );

    return value;
}