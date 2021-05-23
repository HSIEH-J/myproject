const mysql = require("mysql2");
// Create connection

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: "myproject",
  waitForConnections: true,
  connectionLimit: 10
});

const promiseQuery = db.promise();

module.exports = {
  pool: promiseQuery
};

// if use promisify
// const { promisify } = require("util");
// const mysql = require("mysql")
// const promiseQuery = promisify(db.query).bind(db);
