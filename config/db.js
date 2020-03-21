const mysql = require('mysql2/promise');
const error = require("../app/middleware/error.middleware");

let pool = null;

exports.createPool = async function () {
    pool = mysql.createPool({
        multipleStatements: true,
        //debug: true,
        host: process.env.SENG365_MYSQL_HOST,
        user: process.env.SENG365_MYSQL_USER,
        password: process.env.SENG365_MYSQL_PASSWORD,
        database: process.env.SENG365_MYSQL_DATABASE,
        port: process.env.SENG365_MYSQL_PORT || 3306
    });
};

exports.getPool = function () {
    return pool;
};

exports.getConnection = function() 
{
    return pool.getConnection();
}