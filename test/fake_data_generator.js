require("dotenv").config();
const { NODE_ENV } = process.env;
const { blocks, users } = require("./fake_data");
const { pool } = require("../models/mysql");
const bcrypt = require("bcrypt");
const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser () {
  const encryptedUsers = users.map(user => {
    const encryptedUsers = {
      id: 1,
      provider: "native",
      email: "test1@gmail.com",
      password: user.password ? bcrypt.hashSync(user.password, salt) : null

    };
    return encryptedUsers;
  });
  return await pool.query("INSERT INTO user (id, provider, email, password) VALUES ?", [encryptedUsers.map(x => Object.values(x))]);
}

async function _createFakeBlocks () {
  return await pool.query("INSERT INTO block (id, user_id, folder_id,timestamp, remove) VALUES ?", [blocks.map(x => Object.values(x))]);
}

async function createFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  await _createFakeUser();
  await _createFakeBlocks();
}

async function truncateFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("COMMIT");
    await conn.release();
  };
  const tables = ["block", "user"];
  for (const table of tables) {
    await truncateTable(table);
  }
}

async function closeConnection () {
  return await pool.end();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection
};
