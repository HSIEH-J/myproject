const { pool } = require("./mysql");
const { getFolder, findAllParentFolder, getBookmark, getStickyNote, updateItemAfterChange } = require("./bookmark_model");
const { sortData } = require("../util/util");
const cache = require("../util/cache");

const sidebarData = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const parent = await getFolder([userId], { type: "getMainData" });
    const data = [];
    console.log(parent);
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

const organizeData = async (arr, userId) => {
  const results = await Promise.all(arr.map(async (el) => {
    if (el.url) {
      return { type: "bookmark", id: el.id, url: el.url, title: el.title, thumbnail: el.thumbnail };
    } else if (el.folder_name) {
      return { type: "folder", id: el.id, folder_name: el.folder_name };
    } else {
      const cacheData = await cache.get(userId);
      const dataTrans = JSON.parse(cacheData);
      if (dataTrans) {
        const folderData = dataTrans.filter(item => item[0] === el.id);
        if (folderData.length !== 0) {
          console.log(folderData);
          el.text = folderData[0][1].text;
        }
      }
      return { type: "stickyNote", id: el.id, text: el.text };
    }
  }));
  return results;
};

const getBlockData = async (folderId, userId) => {
  try {
    const blockIds = await pool.query("SELECT id, timestamp, width, height FROM block WHERE folder_id = ? ORDER BY timestamp", [folderId]);
    const blocks = {};
    for (const item of blockIds[0]) {
      const bookmarkData = await getBookmark([item.id], { type: "getBlockData" });
      const folderData = await getFolder([item.id], { type: "getBlockData" });
      const noteData = await getStickyNote([item.id], { type: "getBlockData" });
      const concatData = [...bookmarkData, ...folderData, ...noteData];
      sortData(concatData);
      const receiveOrganizeData = await organizeData(concatData, userId);
      blocks[item.id] = { id: item.id, timestamp: item.timestamp, width: item.width, height: item.height, children: receiveOrganizeData };
    }
    return blocks;
  } catch (error) {
    return { error: error };
  }
};

const changeFolderName = async (name, id) => {
  await pool.query("UPDATE folder SET folder_name = ? WHERE id = ?", [name, id]);
};

const updateBlockSize = async (data) => {
  await pool.query("UPDATE block SET width = ?, height = ? WHERE id=?", [data.width, data.height, data.id]);
};

const updateStickyNote = async (data, user) => {
  for (const n of data) {
    await pool.query("UPDATE stickyNote SET text = ? WHERE id=? && user_id = ?", [n[1], n[0], user]);
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
module.exports = { sidebarData, getBlockData, changeFolderName, updateBlockSize, updateStickyNote, insertIntoSidebarFolder };
