const router = require("express").Router();
const { getThumbnail } = require("../controller/bookmark_controller");
const { authentication } = require("../util/util");

// import url
router.route("/bookmark/thumbnail").post(authentication(), getThumbnail);

module.exports = router;
