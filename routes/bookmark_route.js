const router = require("express").Router();
const { getThumbnail, containerData, createItem, sequenceChange, insertIntoSubfolder, updateBlock, removeItem } = require("../controller/bookmark_controller");
const { authentication } = require("../util/util");

// import url
router.route("/test").post(authentication(), getThumbnail);
// get first level data
router.route("/get").get(authentication(), containerData);
// create folder data
router.route("/item").post(authentication(), createItem);
// change sequence
router.route("/change").post(authentication(), sequenceChange);
// drop into another folder
router.route("/subfolder").post(authentication(), insertIntoSubfolder);

router.route("/update").post(authentication(), updateBlock);

router.route("/remove").post(authentication(), removeItem);

module.exports = router;
