const { pool } = require("./mysql");

const sidebarData = async (id) => {
  const parent = await pool.query("SELECT id, folder_name, folder_id FROM folder WHERE folder_id = 0 && user_id = ?", id);
  // console.log(parent[0]);
  const data = [];
  for (const n of parent[0]) {
    data.push({ id: n.id, name: n.folder_name, folder_id: n.folder_id });
    const folderData = await pool.query("WITH RECURSIVE cte (id, folder_name, folder_id) AS (select id, folder_name, folder_id from folder WHERE folder_id = ? UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.folder_id = cte.id) SELECT * FROM cte", n.id);
    const arr = folderData[0];
    arr.forEach(e => data.push({ id: e.id, name: e.folder_name, folder_id: e.folder_id }));
  }
  // console.log(data);
  return data;
};

const getAllFolders = async (id) => {
  const folders = await pool.query("SELECT id, folder_name FROM folder WHERE user_id = ?", id);
  return folders[0];
};

module.exports = { sidebarData, getAllFolders };
