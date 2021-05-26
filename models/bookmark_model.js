const axios = require("axios");
const sharp = require("sharp");
const { pool } = require("./mysql");
const aws = require("aws-sdk");

aws.config.update({ accessKeyId: process.env.S3_ID, secretAccessKey: process.env.S3_PWD });

const getThumbnail = async function (url) {
  // convert img url and insert into aws s3
  const input = (await axios({ url: `http://capture.heartrails.com/medium?${url}`, responseType: "arraybuffer" })).data;
  const output = await sharp(input).toFormat("jpeg").toBuffer();
  return output;
};

const getTitle = async function (url) {
  // get img title
  const get = await axios.get(`http://capture.heartrails.com/api/capture/medium/?${url}`);
  const { data } = get;
  return data;
};

const insertContainerData = async function (insert) {
  await pool.query("INSERT INTO bookmark SET ?", insert);
};

// const checkUrl = async function (url) {
//   const check = await pool.query("SELECT url FROM bookmark WHERE url = ? FOR UPDATE", url);
//   if (check[0].length !== 0) {
//     return false;
//   } else {
//     return true;
//   }
// };

const getContainerData = async function () {
  const data = await pool.query("SELECT id, url, title, thumbnail, sequence, timestamp FROM bookmark WHERE folder_id IS NULL");
  return data;
};

const getFolderData = async function () {
  const data = await pool.query("SELECT id, folder_name, sequence, timestamp FROM folder WHERE folder_id = 0");
  return data;
};

const getSubfolderData = async (id) => {
  const bookmark = await pool.query("SELECT * FROM bookmark WHERE folder_id = ?", id);
  return bookmark[0];
};

const getSubfolderBookmarkData = async (id) => {
  const folder = await pool.query("SELECT * FROM folder WHERE folder_id = ?", id);
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

const uploadS3 = async function (url) {
  // generate img name
  const urlArr = url.split("/");
  const name = urlArr[2] + Date.now() + ".jpeg";
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

const createFolder = async (insert) => {
  await pool.query("INSERT INTO folder set ?", insert);
};

const sequenceChange = async (data) => {
  for (const n of data) {
    if (n.type === "bookmark") {
      await pool.query("UPDATE bookmark SET sequence=?, timestamp=? WHERE id=?", [n.order, n.time, n.id]);
    } else {
      await pool.query("UPDATE folder SET sequence=?, timestamp=? WHERE id=?", [n.order, n.time, n.id]);
    }
  }
};

const insertIntoSubfolder = async (data) => {
  if (data.type === "bookmark") {
    console.log("===bookmark===");
    await pool.query("UPDATE bookmark SET folder_id=?, timestamp=? WHERE id=?", [data.folder_id, data.time, data.update_id]);
  } else {
    await pool.query("UPDATE folder SET folder_id=?, timestamp=? WHERE id=?", [data.folder_id, data.time, data.update_id]);
  }
};

module.exports = {
  getThumbnail,
  insertContainerData,
  getTitle,
  uploadS3,
  getContainerData,
  createFolder,
  getFolderData,
  sequenceChange,
  insertIntoSubfolder,
  getSubfolderData,
  getSubfolderBookmarkData
};
