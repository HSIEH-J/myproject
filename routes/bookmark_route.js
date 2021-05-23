const router = require("express").Router();
const { importThumbnailData, containerData, createFolder, sequenceChange, insertIntoSubfolder } = require("../controller/bookmark_controller");

router.route("/test").post(importThumbnailData);
router.route("/get").get(containerData);
router.route("/folder").post(createFolder);
router.route("/change").post(sequenceChange);
router.route("/subfolder").post(insertIntoSubfolder);

module.exports = router;
