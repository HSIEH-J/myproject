const router = require("express").Router();
const { getNestData, getAllFolders, insertDivTable, getDivData, changeFolderName, updateBlockSize, cacheTest } = require("../controller/folder_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/nest").get(authentication(), getNestData);
router.route("/all").get(authentication(), getAllFolders);
router.route("/block").post(authentication(), insertDivTable);
router.route("/div").get(authentication(), getDivData);
router.route("/name").post(authentication(), changeFolderName);
router.route("/size").post(authentication(), updateBlockSize);
router.route("/cache").get(cacheTest);

module.exports = router;
