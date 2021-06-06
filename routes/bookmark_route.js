const router = require("express").Router();
const { importThumbnailData, containerData, insertItem, sequenceChange, insertIntoSubfolder, updateBlock, removeItem } = require("../controller/bookmark_controller");
const { authentication } = require("../util/util");

// import url
router.route("/test").post(authentication(), importThumbnailData);
// get first level data
router.route("/get").get(authentication(), containerData);
// create folder data
router.route("/item").post(authentication(), insertItem);
// change sequence
router.route("/change").post(authentication(), sequenceChange);
// drop into another folder
router.route("/subfolder").post(authentication(), insertIntoSubfolder);

router.route("/update").post(authentication(), updateBlock);

router.route("/remove").post(authentication(), removeItem);

module.exports = router;
