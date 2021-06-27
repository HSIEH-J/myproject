const { pool } = require("./mysql");

const changeName = async (name, id) => {
  await pool.query("UPDATE folder SET folder_name = ? WHERE id = ?", [name, id]);
};

module.exports = { changeName };
