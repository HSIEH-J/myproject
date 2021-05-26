const router = require("express").Router();
const { importThumbnailData, containerData, createFolder, sequenceChange, insertIntoSubfolder } = require("../controller/bookmark_controller");
const { authentication } = require("../util/util");

// import url
router.route("/test").post(authentication(), importThumbnailData);
// get first level data
router.route("/get").get(authentication(), containerData);
// create folder data
router.route("/folder").post(authentication(), createFolder);
// change sequence
router.route("/change").post(authentication(), sequenceChange);
// drop into another folder
router.route("/subfolder").post(authentication(), insertIntoSubfolder);

module.exports = router;
