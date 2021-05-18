const axios = require("axios");
const sharp = require("sharp");
const { query } = require("./mysql");
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
  await query("INSERT INTO container SET ?", insert);
};

const getContainerData = async function () {
  const data = await query("SELECT address, title, img FROM container");
  return data;
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

module.exports = { getThumbnail, insertContainerData, getTitle, uploadS3, getContainerData };
