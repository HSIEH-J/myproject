const axios = require("axios");
const sharp = require("sharp");
const { pool } = require("./mysql");
const aws = require("aws-sdk");

aws.config.update({ accessKeyId: process.env.S3_ID, secretAccessKey: process.env.S3_PWD });

// call thumbnail Api to get thumbnail
const getThumbnail = async function (url) {
  // convert img url and insert into aws s3
  const input = (await axios({ url: `http://capture.heartrails.com/medium?${url}`, responseType: "arraybuffer" })).data;
  const output = await sharp(input).toFormat("jpeg").toBuffer();
  return output;
};

// call thumbnail Api to get thumbnail info
const getTitle = async function (url) {
  // get img title
  const get = await axios.get(`http://capture.heartrails.com/api/capture/medium/?${url}`);
  const { data } = get;
  return data;
};

// insert bookmark into bookmark table
const insertContainerData = async function (insert) {
  const result = await pool.query("INSERT INTO bookmark SET ?", insert);
  return result;
};

// const checkUrl = async function (url) {
//   const check = await pool.query("SELECT url FROM bookmark WHERE url = ? FOR UPDATE", url);
//   if (check[0].length !== 0) {
//     return false;
//   } else {
//     return true;
//   }
// };

// get first level bookmarks
const getContainerData = async function (id) {
  const data = await pool.query("SELECT id, url, title, thumbnail, sequence, timestamp FROM bookmark WHERE folder_id IS NULL && user_id =? && remove = 0", id);
  return data;
};

// get first level folders
const getFolderData = async function (id) {
  const data = await pool.query("SELECT id, folder_name, sequence, timestamp FROM folder WHERE folder_id = '0' && user_id=? && remove = 0", id);
  return data;
};

// get subfolder folders
const getSubfolderData = async (id, userId) => {
  const bookmark = await pool.query("SELECT * FROM bookmark WHERE folder_id = ? && user_id = ? && div_id IS NULL && remove = 0", [id, userId]);
  return bookmark[0];
};

// get subfolder bookmarks
const getSubfolderBookmarkData = async (id, userId) => {
  const folder = await pool.query("SELECT * FROM folder WHERE folder_id = ? && user_id = ? && div_id IS NULL && remove = 0", [id, userId]);
  return folder[0];
};

const getLocation = (s3, params) => {
  let location;
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        console.log("ERROR MSG: ", err);
      } else {
        console.log("Successfully uploaded data" + data.Location);
        location = data.Location;
      }
      resolve(location);
    });
  });
};

const uploadS3 = async function (url, time) {
  // generate img name
  // const urlArr = url.split("/");
  const name = time + ".jpeg";
  console.log(name);
  // get buffer
  const optimized = await getThumbnail(url);
  // set s3
  const s3 = new aws.S3();
  const params = {
    Bucket: "stylish-upload",
    Key: name,
    Body: optimized,
    ContentType: "image/jpeg",
    ACL: "public-read"
  };
  // upload img to s3
  const address = await getLocation(s3, params);
  return address;
};

const createItem = async (type, insert) => {
  if (type === "folder") {
    await pool.query("INSERT INTO folder set ?", insert);
  } else if (type === "stickyNote") {
    await pool.query("INSERT INTO stickyNote set ?", insert);
  }
};

// drag and drop
const sequenceChange = async (data, userId) => {
  for (const n of data) {
    if (n.type === "bookmark") {
      await pool.query("UPDATE bookmark SET sequence=?, timestamp=? WHERE id = ? && user_id = ?", [n.order, n.time, n.id, userId]);
    } else {
      await pool.query("UPDATE folder SET sequence=?, timestamp=? WHERE id=? && user_id = ?", [n.order, n.time, n.id, userId]);
    }
  }
};

// drag and drop
const insertIntoSubfolder = async (data, userId) => {
  if (data.type === "bookmark") {
    console.log("===bookmark===");
    if (!data.div_id) {
      await pool.query("UPDATE bookmark SET div_id = NULL, folder_id=?, timestamp=? WHERE id=? && user_id = ?", [data.folder_id, data.time, data.update_id, userId]);
    } else {
      await pool.query("UPDATE bookmark SET div_id=?, timestamp=? WHERE id=? && user_id = ?", [data.div_id, data.time, data.update_id, userId]);
    }
  } else {
    if (!data.div_id) {
      await pool.query("UPDATE folder SET div_id = NULL,folder_id=?, timestamp=? WHERE id=?  && user_id = ?", [data.folder_id, data.time, data.update_id, userId]);
    } else {
      await pool.query("UPDATE folder SET div_id=?, timestamp=? WHERE id=?  && user_id = ?", [data.div_id, data.time, data.update_id, userId]);
    }
  }
};

const updateBlock = async (data, id) => {
  if (data.type === "bookmark") {
    console.log("===bookmark===");
    await pool.query("UPDATE bookmark SET div_id = NULL, timestamp=? WHERE id=? && user_id = ?", [data.time, data.update_id, id]);
  } else {
    await pool.query("UPDATE folder SET div_id = NULL, timestamp=? WHERE id=? && user_id = ?", [data.time, data.update_id, id]);
  }
};

const removeAllItem = async (type, id, userId) => {
  console.log(type);
  if (type === "bookmark") {
    await pool.query("UPDATE bookmark SET remove = 1  WHERE id=? && user_id = ?", [id, userId]);
  } else if (type === "folder") {
    await pool.query("UPDATE folder SET remove = 1 WHERE id=? && user_id = ?", [id, userId]);
    await pool.query("UPDATE bookmark SET remove = 1  WHERE folder_id= ? && user_id = ?", [id, userId]);
    await pool.query("UPDATE block SET remove = 1  WHERE folder_id = ? && user_id = ?", [id, userId]);
    const folder = await pool.query("WITH RECURSIVE cte (id, folder_name, folder_id) AS (select id, folder_name, folder_id from folder WHERE folder_id = ? UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.folder_id = cte.id) SELECT id, folder_id FROM cte", [id]);
    if (folder[0].length !== 0) {
      for (const n of folder[0]) {
        await pool.query("UPDATE folder SET remove = 1 WHERE id=?", [n.id]);
        await pool.query("UPDATE bookmark SET remove = 1 WHERE folder_id = ?", [n.id]);
        await pool.query("UPDATE block SET remove = 1 WHERE folder_id = ?", [n.id]);
      }
    }
  } else {
    await pool.query("UPDATE block SET remove = 1  WHERE id = ? && user_id = ?", [id, userId]);
    await pool.query("UPDATE bookmark SET remove = 1  WHERE div_id = ? && user_id = ?", [id, userId]);
    await pool.query("UPDATE folder SET remove = 1  WHERE div_id = ? && user_id = ?", [id, userId]);
    const all = pool.query("SELECT id FROM folder WHERE div_id = ?", [id]);
    console.log(all);
    const data = [];
    if (all[0].length !== 0) {
      for (const n of all[0]) {
        const folder = await pool.query("WITH RECURSIVE cte (id, folder_name, folder_id) AS (select id, folder_name, folder_id from folder WHERE folder_id = ? UNION ALL SELECT t1.id, t1.folder_name, t1.folder_id FROM folder t1 INNER JOIN cte ON t1.folder_id = cte.id) SELECT id, folder_id FROM cte", [n.id]);
        data.push(folder);
      }
      console.log(data);
      for (const n of data) {
        await pool.query("UPDATE folder SET remove = 1 WHERE id=?", [n.id]);
        await pool.query("UPDATE bookmark SET remove = 1 WHERE folder_id = ?", [n.id]);
        await pool.query("UPDATE block SET remove = 1 WHERE folder_id = ?", [n.id]);
      }
    }
  }
};

module.exports = {
  getThumbnail,
  insertContainerData,
  getTitle,
  uploadS3,
  getContainerData,
  createItem,
  getFolderData,
  sequenceChange,
  insertIntoSubfolder,
  getSubfolderData,
  getSubfolderBookmarkData,
  updateBlock,
  removeAllItem
};
