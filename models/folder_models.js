const { pool } = require("./mysql");

const sidebarData = async (id) => {
  const parent = await pool.query("SELECT id, folder_name, folder_id, timestamp FROM folder WHERE folder_id = '0' && user_id = ? && remove = 0 ORDER BY timestamp", id);
  // console.log(parent[0]);
  const data = [];
  for (const n of parent[0]) {
    data.push({ id: n.id, name: n.folder_name, folder_id: n.folder_id, time: n.timestamp });
    const folderData = await pool.query("WITH RECURSIVE cte (id, folder_name, folder_id, timestamp, remove) AS (select id, folder_name, folder_id, timestamp, remove from folder WHERE folder_id = ?  UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id , t1.timestamp, t1.remove FROM folder t1 INNER JOIN cte ON t1.folder_id = cte.id) SELECT * FROM cte WHERE remove = 0 ORDER BY timestamp", n.id);
    const arr = folderData[0];
    arr.forEach(e => data.push({ id: e.id, name: e.folder_name, folder_id: e.folder_id, time: e.timestamp }));
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

// const insertStickyNote = async (data) => {
//   await pool.query("INSERT INTO stickyNote SET ?", data);
// };

const getBlockData = async (user, folder) => {
  const data = await pool.query("SELECT bookmark.div_id, bookmark.id AS bookmark_id, bookmark.url, bookmark.title, bookmark.thumbnail, bookmark.timestamp, block.timestamp AS divTime, block.width, block.height FROM bookmark INNER JOIN block ON bookmark.div_id = block.id WHERE bookmark.user_id = ? && bookmark.folder_id = ? && bookmark.remove = 0 ORDER BY bookmark.timestamp;", [user, folder]);
  const folderData = await pool.query("SELECT folder.folder_name, folder.id AS subfolder_id, folder.sequence, folder.timestamp, block.id AS div_id, block.timestamp AS divTime, block.width, block.height FROM folder INNER JOIN block ON folder.div_id = block.id WHERE folder.user_id = ? && folder.folder_id = ?  && folder.remove = 0 ORDER BY folder.timestamp", [user, folder]);
  const noteData = await pool.query("SELECT stickyNote.text, stickyNote.id AS note_id, stickyNote.sequence, stickyNote.timestamp, block.id AS div_id, block.timestamp AS divTime, block.width, block.height FROM stickyNote INNER JOIN block ON stickyNote.div_id = block.id WHERE stickyNote.user_id = ? && stickyNote.folder_id = ?  && stickyNote.remove = 0 ORDER BY stickyNote.timestamp", [user, folder]);
  const concatData = data[0].concat(folderData[0], noteData[0]);
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

const changeFolderName = async (name, id, userId) => {
  await pool.query("UPDATE folder SET folder_name = ? WHERE id=? && user_id = ?", [name, id, userId]);
};

const updateBlockSize = async (data, user) => {
  await pool.query("UPDATE block SET width = ?, height = ? WHERE id=? && user_id = ?", [data.width, data.height, data.id, user]);
};

const updateStickyNote = async (data, user) => {
  for (const n of data) {
    await pool.query("UPDATE stickyNote SET text = ? WHERE id=? && user_id = ?", [n[1], n[0], user]);
  }
};

const insertSidebarFolder = async (data, user) => {
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
      await conn.query("UPDATE folder SET div_id = NULL , folder_id = ? WHERE id = ? && user_id = ?", [data.folder_id, data.update_id, user]);
    } else {
      await pool.query("UPDATE bookmark SET div_id = NULL, folder_id=?, timestamp=? WHERE id=? && user_id = ?", [data.folder_id, data.time, data.update_id, user]);
    }
    console.log("no error model");
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    console.log("error");
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};
// const getBlockData = async (folder, user) => {
//   const bookmarkData = await pool.query("WITH div_data AS (SELECT * FROM bookmark WHERE folder_id = ? && user_id = ? && div_id IS NOT NULL) SELECT * FROM div_data INNER JOIN block ON block.id = div_data.div_id ORDER BY div_data.timestamp;", [folder, user]);
//   const folderData = await pool.query("WITH div_data AS (SELECT * FROM folder WHERE folder_id = ? && user_id = ? && div_id IS NOT NULL) SELECT * FROM div_data INNER JOIN block ON block.id = div_data.div_id ORDER BY div_data.timestamp;", [folder, user]);
//   console.log(bookmarkData[0]);
//   console.log(folderData[0]);
//   const concatData = bookmarkData[0].concat(folderData[0]);
//   return concatData;
// };

module.exports = { sidebarData, getAllFolders, insertDivTable, getBlockData, changeFolderName, updateBlockSize, updateStickyNote, insertSidebarFolder };
