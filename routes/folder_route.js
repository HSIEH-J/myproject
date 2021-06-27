const router = require("express").Router();
const { changeFolderName } = require("../controller/folder_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/folder/name").post(authentication(), changeFolderName);

module.exports = router;
