const db = require("../../config/db");

/**
 * @description returns all of the signatures associated with the given petition
 * @param {Number} petID the id of the Petition
 * @returns a list of the signatures the petition has
 */
exports.get = async function(petID)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "SELECT * FROM Signature WHERE petition_id = ?", 
        petID
    );

    return value;
}

/**
 * @description add the given users signature to the petition
 * @param {Number} petID the id of the petition
 * @param {Number} userID the id of the user
 * @returns details of the addition
 */
exports.add = async function(petID, userID) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Signature SET ?", 
        {
            petition_id: petID,
            signatory_id: userID,
            signed_date: new Date()
        }
    );

    return value;
}

/**
 * @description deletes the given users signature off the given petition
 * @param {Number} petID the id of the petition
 * @param {Number} userID the id of the user to remove
 * @returns details of the deletion
 */
exports.delete = async function(petID, userID)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "DELETE FROM Signature WHERE petition_id = ? AND signatory_id = ?", 
        [petID, userID]
    );

    return value;
}