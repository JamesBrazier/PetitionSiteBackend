const db = require("../../config/db");

exports.get = async function(id)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query("SELECT * FROM Petition WHERE petition_id = ?", id);

    return value;
}

exports.getAll = async function()
{
    const connection = await db.getPool().getConnection();

    let [values, _] = await connection.query("SELECT * FROM Petition");

    return values;
}

exports.getFields = async function(id, fields) 
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "SELECT ? FROM Petition WHERE petition_id = ?",
        [
            fields,
            id
        ]
    );

    return value;
}

exports.search = async function(params)
{
    throw new Error("Not implemented yet");
}

exports.add = async function(id, data)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "INSERT INTO Petition (author_id, category_id, closing_date, created_data, description, title) VALUES ?",
        [[[
            id,
            data.categoryId,
            data.closingDate,
            new Date(),
            data.description,
            data.title
        ]]]
    );

    return value;
}

exports.delete = async function(id)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query("DELETE FROM Petition WHERE petition_id = ?", id);

    return value;
}

exports.update = async function(id, data)
{
    const connection = await db.getPool().getConnection();

    let [value, _] = await connection.query(
        "UPDATE Petition SET title = ?, description = ?, category_id = ?, closing_date = ? WHERE petition_id = ?",
        [
            data.title,
            data.description,
            data.categoryId,
            data.closingDate,
            id
        ]
    );

    return value;
}

exports.updateFields = async function(id, fields, values)
{
    const connection = await db.getPool().getConnection();

    for (let i = 0; i < fields.length; i++) {
        let [value, _] = await connection.query(
            "UPDATE Petition SET ? = ? WHERE petition_id = ?", 
            [
                fields[i],
                values[i],
                id
            ]
        );
    }

    return value;
}
