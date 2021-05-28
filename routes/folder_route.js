const router = require("express").Router();
const { getNestData, getAllFolders } = require("../controller/folder_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/nest").get(authentication(), getNestData);
router.route("/all").get(authentication(), getAllFolders);

module.exports = router;
