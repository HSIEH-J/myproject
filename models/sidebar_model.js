const { pool } = require("./mysql");
const { getFolder, findAllParentFolder, updateItemAfterChange } = require("./item_model");

const sidebarData = async (user) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const parent = await getFolder([user], { type: "getMainData" });
    const data = [];
    for (const n of parent) {
      data.push({ id: n.id, name: n.folder_name, folder_id: n.folder_id, time: n.timestamp });
      const folders = await findAllParentFolder(n.id);
      folders.forEach(e => data.push({ id: e.id, name: e.folder_name, folder_id: e.folder_id, time: e.timestamp }));
    }
    await conn.query("COMMIT");
    return data;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error: error };
  } finally {
    await conn.release();
  }
};

const insertIntoSidebarFolder = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    if (data.type === "folder") {
      const parent = await conn.query("SELECT folder_id from folder WHERE id = ?", [data.update_id]);
      if (parent[0][0].folder_id === data.folder_id) {
        return { error: "already in this folder!" };
      }
      const traceParent = await conn.query("WITH RECURSIVE cte (id,folder_id) AS (SELECT id, folder_id FROM folder WHERE id = ? UNION ALL SELECT t1.id, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.id = cte.folder_id) SELECT * FROM cte WHERE folder_id = ?;", [data.folder_id, data.update_id]);
      if (traceParent[0].length !== 0) {
        return { error: "The operation could not be completed" };
      }
      await updateItemAfterChange([data.folder_id, data.time, data.update_id], { type: "insertIntoFolder", table: "folder" });
    } else {
      await updateItemAfterChange([data.folder_id, data.time, data.update_id], { type: "insertIntoFolder", table: "bookmark" });
    }
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = { sidebarData, insertIntoSidebarFolder };
