// aws S3
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const multer = require("multer");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ID,
  secretAccesskey: process.env.S3_PWD
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: "stylish-upload",
    ACL: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

module.exports = { uploadS3, s3 };
