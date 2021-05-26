const router = require("express").Router();
const { importThumbnailData, containerData, createFolder, sequenceChange, insertIntoSubfolder } = require("../controller/bookmark_controller");

// import url
router.route("/test").post(importThumbnailData);
// get first level data
router.route("/get").get(containerData);
// create folder data
router.route("/folder").post(createFolder);
// change sequence
router.route("/change").post(sequenceChange);
// drop into another folder
router.route("/subfolder").post(insertIntoSubfolder);

module.exports = router;
