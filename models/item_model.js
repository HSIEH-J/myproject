const { pool } = require("./mysql");

const getFolder = async (insert, requirement = {}) => {
  const condition = { binding: "" };
  if (requirement.type === "getMainData") {
    condition.binding = "WHERE folder_id = '0' && user_id=? && remove = 0 ORDER BY timestamp";
  } else if (requirement.type === "getSubfolderData") {
    condition.binding = "WHERE folder_id = ? && div_id IS NULL && remove = 0 ORDER BY timestamp";
  } else {
    condition.binding = "WHERE div_id = ? && remove = 0 ORDER BY timestamp";
  }
  const folderQuery = "SELECT id, folder_name, sequence, timestamp FROM folder " + condition.binding;
  const folder = await pool.query(folderQuery, insert);
  return folder[0];
};

const getBookmark = async (insert, requirement = {}) => {
  const condition = { binding: "" };
  if (requirement.type === "getMainData") {
    condition.binding = "WHERE folder_id IS NULL && user_id =? && remove = 0 ORDER BY timestamp";
  } else if (requirement.type === "getSubfolderData") {
    condition.binding = "WHERE folder_id = ? && div_id IS NULL && remove = 0 ORDER BY timestamp";
  } else {
    condition.binding = "WHERE div_id = ? && remove = 0 ORDER BY timestamp";
  }
  const bookmarkQuery = "SELECT id, url, title, thumbnail, sequence, timestamp FROM bookmark " + condition.binding;
  const bookmark = await pool.query(bookmarkQuery, insert);
  return bookmark[0];
};

const getStickyNote = async (insert, requirement = {}) => {
  const condition = { binding: "" };
  if (requirement.type === "getSubfolderData") {
    condition.binding = "WHERE folder_id = ? && div_id IS NULL && remove = 0 ORDER BY timestamp";
  } else {
    condition.binding = "WHERE div_id = ? && remove = 0 ORDER BY timestamp";
  }
  const stickyNoteQuery = "SELECT id, text, sequence, timestamp FROM sticky_note " + condition.binding;
  const stickyNote = await pool.query(stickyNoteQuery, insert);
  return stickyNote[0];
};

// get first level bookmarks
const getMainData = async (userId) => {
  const bookmark = await getBookmark([userId], { type: "getMainData" });
  const folder = await getFolder([userId], { type: "getMainData" });
  const data = [...bookmark, ...folder];
  return data;
};

// get subfolder data
const getSubfolderData = async (id) => {
  const bookmarkData = await getBookmark([id], { type: "getSubfolderData" });
  const folderData = await getFolder([id], { type: "getSubfolderData" });
  const data = [...bookmarkData, ...folderData];
  return data;
};

const updateItemAfterChange = async (updateData, requirement = {}) => {
  const condition = { binding: "" };
  if (requirement.type === "insertIntoFolder") {
    condition.binding = "div_id = NULL, folder_id = ?, timestamp = ?";
  } else if (requirement.type === "insertIntoBlock") {
    condition.binding = "div_id = ?, timestamp = ?";
  } else {
    condition.binding = "div_id = NULL, timestamp = ?";
  }
  const itemQuery = "UPDATE " + requirement.table + " SET " + condition.binding + "  WHERE id = ?";
  await pool.query(itemQuery, updateData);
};

const createItem = async (type, insert) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    if (type === "folder") {
      await pool.query("INSERT INTO folder set ?", insert);
    } else if (type === "stickyNote") {
      await pool.query("INSERT INTO sticky_note set ?", insert);
    } else {
      await pool.query("INSERT INTO block set ?", insert);
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

// drag and drop
const sequenceChange = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    for (const n of data) {
      if (n.type === "bookmark") {
        await pool.query("UPDATE bookmark SET sequence = ?, timestamp = ? WHERE id = ?", [n.order, n.time, n.id]);
      } else if (n.type === "folder") {
        await pool.query("UPDATE folder SET sequence = ?, timestamp = ? WHERE id = ?", [n.order, n.time, n.id]);
      } else {
        await pool.query("UPDATE sticky_note SET sequence = ?, timestamp = ? WHERE id = ?", [n.order, n.time, n.id]);
      }
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

// insert into another folder or block
// race condition
const insertIntoAnotherItem = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    if (data.type === "bookmark") {
      if (!data.div_id) {
        await updateItemAfterChange([data.folder_id, data.time, data.update_id], { type: "insertIntoFolder", table: "bookmark" });
      } else {
        await updateItemAfterChange([data.div_id, data.time, data.update_id], { type: "insertIntoBlock", table: "bookmark" });
      }
    } else if (data.type === "folder") {
      if (!data.div_id) {
        await updateItemAfterChange([data.folder_id, data.time, data.update_id], { type: "insertIntoFolder", table: "folder" });
      } else {
        await updateItemAfterChange([data.div_id, data.time, data.update_id], { type: "insertIntoBlock", table: "folder" });
      }
    } else {
      if (!data.div_id) {
        await updateItemAfterChange([data.folder_id, data.time, data.update_id], { type: "insertIntoFolder", table: "sticky_note" });
      } else {
        await updateItemAfterChange([data.div_id, data.time, data.update_id], { type: "insertIntoBlock", table: "sticky_note" });
      }
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

const findAllParentFolder = async (id) => {
  const data = await pool.query("WITH RECURSIVE cte (id, folder_name, folder_id, timestamp, remove) AS (select id, folder_name, folder_id, timestamp, remove from folder WHERE folder_id = ?  UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id , t1.timestamp, t1.remove FROM folder t1 INNER JOIN cte ON t1.folder_id = cte.id) SELECT * FROM cte WHERE remove = 0 ORDER BY timestamp", [id]);
  return data[0];
};

const removeAllFolder = async (id) => {
  await pool.query("UPDATE folder SET remove = 1 WHERE id = ?", [id]);
  await pool.query("UPDATE bookmark SET remove = 1 WHERE folder_id = ?", [id]);
  await pool.query("UPDATE block SET remove = 1 WHERE folder_id = ?", [id]);
  await pool.query("UPDATE sticky_note SET remove = 1 WHERE folder_id = ?", [id]);
};

const removeItem = async (type, id) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    if (type === "bookmark") {
      await pool.query("UPDATE bookmark SET remove = 1  WHERE id = ?", [id]);
    } else if (type === "folder") {
      await removeAllFolder(id);
      const folder = await findAllParentFolder(id);
      if (folder.length !== 0) {
        for (const item of folder) {
          await removeAllFolder(item.id);
        }
      }
    } else if (type === "block") {
      await pool.query("UPDATE block SET remove = 1  WHERE id = ?", [id]);
      await pool.query("UPDATE bookmark SET remove = 1  WHERE div_id = ?", [id]);
      await pool.query("UPDATE folder SET remove = 1  WHERE div_id = ?", [id]);
      await pool.query("UPDATE sticky_note SET remove = 1  WHERE div_id = ?", [id]);
      const allParentFolder = await pool.query("SELECT id FROM folder WHERE div_id = ?", [id]);
      if (allParentFolder[0].length !== 0) {
        const data = [];
        for (const item of allParentFolder[0]) {
          const folder = await findAllParentFolder(item.id);
          folder.forEach(el => data.push({ id: el.id }));
        }
        for (const item of data) {
          await removeAllFolder(item.id);
        }
      }
    } else {
      await pool.query("UPDATE sticky_note SET remove = 1  WHERE id=?", [id]);
    }
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    await conn.query("ROLLBACK");
    return { error: error };
  } finally {
    await conn.release();
  }
};

const verifyUserData = async (user, id, table) => {
  const condition = { table: "" };
  if (table === "bookmark") {
    condition.table = "bookmark";
  } else if (table === "folder") {
    condition.table = "folder";
  } else if (table === "sticky_note") {
    condition.table = "sticky_note";
  } else {
    condition.table = "block";
  }
  const checkQuery = "SELECT * FROM " + condition.table + " WHERE user_id = ? && id = ?";
  const result = await pool.query(checkQuery, [user, id]);
  return result[0];
};

module.exports = {
  updateItemAfterChange,
  getBookmark,
  getFolder,
  getStickyNote,
  getMainData,
  getSubfolderData,
  createItem,
  sequenceChange,
  insertIntoAnotherItem,
  removeItem,
  verifyUserData,
  findAllParentFolder
};
