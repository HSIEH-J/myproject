const { pool } = require("./mysql");
const { getFolder, getBookmark, getStickyNote, updateItemAfterChange } = require("./item_model");
const { sortData } = require("../util/util");
const cache = require("../util/cache");

const organizeData = async (arr, user) => {
  const results = await Promise.all(arr.map(async (el) => {
    if (el.url) {
      return { type: "bookmark", id: el.id, url: el.url, title: el.title, thumbnail: el.thumbnail };
    } else if (el.folder_name) {
      return { type: "folder", id: el.id, folder_name: el.folder_name };
    } else {
      const cacheData = await cache.get(user);
      const dataTrans = JSON.parse(cacheData);
      if (dataTrans) {
        const folderData = dataTrans.filter(item => item[0] === el.id);
        if (folderData.length !== 0) {
          el.text = folderData[0][1].text;
        }
      }
      return { type: "stickyNote", id: el.id, text: el.text };
    }
  }));
  return results;
};

const getBlockData = async (folderId, user) => {
  try {
    const blockIds = await pool.query("SELECT id, timestamp, width, height FROM block WHERE folder_id = ? && remove = 0 ORDER BY timestamp", [folderId]);
    const blocks = {};
    for (const item of blockIds[0]) {
      const bookmarkData = await getBookmark([item.id], { type: "getBlockData" });
      const folderData = await getFolder([item.id], { type: "getBlockData" });
      const noteData = await getStickyNote([item.id], { type: "getBlockData" });
      const concatData = [...bookmarkData, ...folderData, ...noteData];
      sortData(concatData);
      const receiveOrganizeData = await organizeData(concatData, user);
      blocks[item.id] = { id: item.id, timestamp: item.timestamp, width: item.width, height: item.height, children: receiveOrganizeData };
    }
    return blocks;
  } catch (error) {
    return { error: error };
  }
};

const updateSize = async (data) => {
  await pool.query("UPDATE block SET width = ?, height = ? WHERE id=?", [data.width, data.height, data.id]);
};

const removeItem = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    if (data.type === "bookmark") {
      await updateItemAfterChange([data.time, data.update_id], { type: "removeFromBlock", table: "bookmark" });
    } else if (data.type === "folder") {
      await updateItemAfterChange([data.time, data.update_id], { type: "removeFromBlock", table: "folder" });
    } else {
      await updateItemAfterChange([data.time, data.update_id], { type: "removeFromBlock", table: "sticky_note" });
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

module.exports = { getBlockData, updateSize, removeItem };
