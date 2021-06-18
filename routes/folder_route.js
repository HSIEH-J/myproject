const router = require("express").Router();
const { getNestData, getDivData, changeFolderName, updateBlockSize, dropSidebarFolder } = require("../controller/folder_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/nest").get(authentication(), getNestData);
router.route("/div").get(authentication(), getDivData);
router.route("/name").post(authentication(), changeFolderName);
router.route("/size").post(authentication(), updateBlockSize);
router.route("/drag").post(authentication(), dropSidebarFolder);

module.exports = router;
