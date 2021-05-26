const router = require("express").Router();
const { getNestData } = require("../controller/folder_controller");

// get nest data for front-end sidebar
router.route("/nest").get(getNestData);

module.exports = router;
