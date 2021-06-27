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
  const get = await axios.get(`http://capture.heartrails.com/api/capture/medium?${url}`);
  const { data } = get;
  return data;
};

// insert bookmark into bookmark table
const insertBookmark = async function (insert) {
  const result = await pool.query("INSERT INTO bookmark SET ?", insert);
  return result[0];
};

const updateBookmark = async function (title, location, id) {
  await pool.query("UPDATE bookmark SET title = ?, thumbnail = ? WHERE id = ?", [title, location, id]);
};

const checkUrl = async function (url) {
  const check = await pool.query("SELECT * FROM bookmark WHERE url = ?", url);
  if (check[0].length !== 0) {
    if (check[0][0].remove === 1) {
      await pool.query("UPDATE bookmark set remove = 0 where id = ?", [check[0][0].id]);
      return { bookmark: { id: check[0][0].id, title: check[0][0].title, thumbnail: check[0][0].thumbnail } };
    }
    return { error: "url already exists" };
  } else {
    return true;
  }
};

const getLocation = (s3, params) => {
  let location;
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        console.log("ERROR MSG: ", err);
      } else {
        location = data.Location;
      }
      resolve(location);
    });
  });
};

const uploadS3 = async function (url, time) {
  // generate img name
  const name = time + ".jpeg";
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

module.exports = {
  getThumbnail,
  insertBookmark,
  updateBookmark,
  getTitle,
  uploadS3,
  checkUrl
};
