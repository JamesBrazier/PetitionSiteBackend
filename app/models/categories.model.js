const db = require("../../config/db");

exports.get = async function(id) 
{
    const connection = await db.getPool().getConnnection();

    let [value, _] = await connection.query("SELECT * FROM Category WHERE category_id = ?", id);

    return value;
}

exports.getAll = async function()
{
    const connection = await db.getPool().getConnnection();

    let [values, _] = await connection.query("SELECT * FROM Category");

    return values;
}