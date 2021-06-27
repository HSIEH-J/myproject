const router = require("express").Router();
const { getNestData, dropSidebarFolder } = require("../controller/sidebar_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/sidebar/details").get(authentication(), getNestData);
router.route("/sidebar/drag").post(authentication(), dropSidebarFolder);

module.exports = router;
