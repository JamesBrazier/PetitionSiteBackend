const db = require("../../config/db");

exports.getAllPetition = async function(petID)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query("SELECT * FROM Signature WHERE petition_id = ?", petID);

    return value;
}

exports.add = async function(petID, userID) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Signature (petition_id, signatory_id, signed_date) VALUES ?", 
        [[[
            petID,
            userID,
            new Date()
        ]]]
    );

    return value;
}

exports.delete = async function(petID, userID)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "DELETE FROM Signature WHERE petition_id = ? AND signatory_id = ?", 
        [
            petID,
            userID
        ]
    );

    return value;
}