const { pool } = require("./mysql");

const getSearchItem = async (type, user, param) => {
  if (type === "bookmark") {
    const data = await pool.query("SELECT id, folder_id, url, title, thumbnail FROM bookmark WHERE user_id = ? && remove = 0 && title LIKE ?", [user, `%${param}%`]);
    return data[0];
  } else if (type === "folder") {
    const data = await pool.query("SELECT id, folder_id, folder_name FROM folder WHERE user_id = ? && remove = 0 && folder_name LIKE ?", [user, `%${param}%`]);
    return data[0];
  } else if (type === "stickyNote") {
    const data = await pool.query("SELECT id, folder_id, text FROM stickyNote WHERE user_id = ? && remove = 0 && text LIKE ?", [user, `%${param}%`]);
    return data[0];
  } else {
    const data = await pool.query("SELECT id, folder_id, url, title, thumbnail FROM bookmark WHERE user_id = ? && remove = 0 && title LIKE ?", [user, `%${param}%`]);
    const data1 = await pool.query("SELECT id, folder_id, folder_name FROM folder WHERE user_id = ? && remove = 0 && folder_name LIKE ?", [user, `%${param}%`]);
    const data2 = await pool.query("SELECT id, folder_id, text FROM stickyNote WHERE user_id = ? && remove = 0 && text LIKE ?", [user, `%${param}%`]);
    const concatData = data[0].concat(data1[0], data2[0]);
    console.log("all");
    console.log(data[0]);
    console.log(data1[0]);
    console.log(data2[0]);
    console.log(concatData);
    return concatData;
  }
};

const getSearchItemParent = async (folderId) => {
  const route = await pool.query("WITH RECURSIVE cte (id, folder_name ,folder_id) AS (SELECT id, folder_name, folder_id FROM folder WHERE id = ? UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.id = cte.folder_id) SELECT folder_name FROM cte", [folderId]);
  return route[0];
};

module.exports = { getSearchItem, getSearchItemParent };
