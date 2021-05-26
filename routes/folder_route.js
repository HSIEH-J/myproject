const router = require("express").Router();
const { getNestData } = require("../controller/folder_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/nest").get(authentication(), getNestData);

module.exports = router;
