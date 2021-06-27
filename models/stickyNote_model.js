const { pool } = require("./mysql");

const updateStickyNote = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    for (const n of data) {
      await pool.query("UPDATE sticky_note SET text = ? WHERE id=?", [n[1], n[0]]);
    }
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error: error };
  } finally {
    await conn.release();
  }
};

module.exports = { updateStickyNote };
