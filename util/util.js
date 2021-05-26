const { getUserDetail } = require("../models/user_model");

// aws S3
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const multer = require("multer");

// token authentication
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

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

const authentication = () => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }
    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken === "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }
    try {
      const user = jwt.verify(accessToken, TOKEN_SECRET);
      req.user = user;
      const userDetail = await getUserDetail(user.email);
      if (!userDetail) {
        res.status(403).send({ error: "Forbidden" });
      }
      req.user.id = userDetail[0].id;
      next();
      return;
    } catch (err) {
      res.status(403).send({ error: "Forbidden" });
    }
  };
};

module.exports = { uploadS3, s3, authentication };
