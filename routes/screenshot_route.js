const router = require("express").Router();
const { thumbnailData, containerData } = require("../controller/screenshot_controller");

router.route("/test").post(thumbnailData);
router.route("/get").get(containerData);

module.exports = router;
