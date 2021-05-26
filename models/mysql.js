const mysql = require("mysql2/promise");
// Create connection

const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: "myproject",
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(mysqlConfig);

module.exports = { pool };

// if use promisify
// const { promisify } = require("util");
// const mysql = require("mysql")
// const promiseQuery = promisify(db.query).bind(db);
