const { pool } = require("./mysql");

const searchBookmark = async (user, param) => {
  const data = await pool.query("SELECT id, folder_id, url, title, thumbnail FROM bookmark WHERE user_id = ? && remove = 0 && title LIKE ?", [user, `%${param}%`]);
  return data[0];
};

const searchFolder = async (user, param) => {
  const data = await pool.query("SELECT id, folder_id, folder_name FROM folder WHERE user_id = ? && remove = 0 && folder_name LIKE ?", [user, `%${param}%`]);
  return data[0];
};

const searchStickyNote = async (user, param) => {
  const data = await pool.query("SELECT id, folder_id, text FROM stickyNote WHERE user_id = ? && remove = 0 && text LIKE ?", [user, `%${param}%`]);
  return data[0];
};

const getSearchItem = async (type, user, param) => {
  if (type === "bookmark") {
    const bookmarks = await searchBookmark(user, param);
    return bookmarks;
  } else if (type === "folder") {
    const folders = await searchFolder(user, param);
    return folders;
  } else if (type === "stickyNote") {
    const stickyNotes = await searchStickyNote(user, param);
    return stickyNotes;
  } else {
    const bookmarks = await searchBookmark(user, param);
    const folders = await searchFolder(user, param);
    const stickyNotes = await searchStickyNote(user, param);
    const concatData = [...bookmarks[0], ...folders[0], ...stickyNotes[0]];
    return concatData;
  }
};

const getSearchItemParent = async (folderId) => {
  const route = await pool.query("WITH RECURSIVE cte (id, folder_name ,folder_id) AS (SELECT id, folder_name, folder_id FROM folder WHERE id = ? UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.id = cte.folder_id) SELECT folder_name FROM cte", [folderId]);
  return route[0];
};

module.exports = { getSearchItem, getSearchItemParent };
