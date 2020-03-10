const db = require("../../config/db");

exports.get = async function(id) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query("SELECT * FROM User WHERE user_id = ?", id);

    return value;
}

exports.getFields = async function(id, fields) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "SELECT ? FROM User WHERE user_id = ?", 
        [
            fields,
            id
        ]
    );

    return value;
}

exports.add = async function(data, authToken) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO User (name, email, password, city, country, auth_token) VALUES ?", 
        [[[
            data.name,
            data.email,
            data.password,
            data.city,
            data.country,
            authToken
        ]]]
    );

    return value;
}


exports.update = async function(id, data) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "UPDATE User SET name = ?, email = ?, password = ?, city = ?, country = ? WHERE user_id = ?", 
        [
            data.name,
            data.email,
            data.password,
            data.city,
            data.country,
            id
        ]
    );

    return value;
}

exports.updateFields = async function(data) 
{

}

exports.clearFields = async function(data) 
{

}