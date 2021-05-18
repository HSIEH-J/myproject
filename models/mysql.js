const { promisify } = require("util");
const mysql = require("mysql");
// Create connection

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: "bookmark",
  waitForConnections: true,
  connectionLimit: 10
});

const promiseQuery = promisify(db.query).bind(db);

module.exports = { query: promiseQuery };
