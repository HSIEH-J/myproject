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

const insertDivTable = async (data) => {
  await pool.query("INSERT INTO block SET ?", data);
};

const getBlockData = async (user, folder) => {
  const data = await pool.query("SELECT bookmark.div_id, bookmark.id AS bookmark_id, bookmark.url, bookmark.title, bookmark.thumbnail, bookmark.timestamp, block.timestamp AS divTime FROM bookmark INNER JOIN block ON bookmark.div_id = block.id WHERE bookmark.user_id = ? && bookmark.folder_id = ? ORDER BY bookmark.timestamp;", [user, folder]);
  const folderData = await pool.query("SELECT folder.folder_name, folder.id AS subfolder_id, folder.sequence, folder.timestamp, block.id AS div_id, block.timestamp AS divTime FROM folder INNER JOIN block ON folder.div_id = block.id WHERE folder.user_id = ? && folder.folder_id = ? ORDER BY folder.timestamp", [user, folder]);
  const concatData = data[0].concat(folderData[0]);
  concatData.sort((a, b) => {
    if (a.timestamp > b.timestamp) {
      return 1;
    }
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    return 0;
  });
  return concatData;
};

// const getBlockData = async (folder, user) => {
//   const bookmarkData = await pool.query("WITH div_data AS (SELECT * FROM bookmark WHERE folder_id = ? && user_id = ? && div_id IS NOT NULL) SELECT * FROM div_data INNER JOIN block ON block.id = div_data.div_id ORDER BY div_data.timestamp;", [folder, user]);
//   const folderData = await pool.query("WITH div_data AS (SELECT * FROM folder WHERE folder_id = ? && user_id = ? && div_id IS NOT NULL) SELECT * FROM div_data INNER JOIN block ON block.id = div_data.div_id ORDER BY div_data.timestamp;", [folder, user]);
//   console.log(bookmarkData[0]);
//   console.log(folderData[0]);
//   const concatData = bookmarkData[0].concat(folderData[0]);
//   return concatData;
// };

module.exports = { sidebarData, getAllFolders, insertDivTable, getBlockData };
