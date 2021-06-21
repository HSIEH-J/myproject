const mysql = require("mysql2/promise");
const env = process.env.NODE_ENV || "production";
const multipleStatements = (process.env.NODE_ENV === "test");

// Create connection

const mysqlConfig = {
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: "myproject"
    // waitForConnections: true,
    // connectionLimit: 20
  },
  test: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: "myproject_test"
    // waitForConnections: true,
    // connectionLimit: 20
  }

};

const mysqlEnv = mysqlConfig[env];
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;
const pool = mysql.createPool(mysqlEnv, { multipleStatements });

module.exports = { pool };
