const router = require("express").Router();
const { getDivData, updateBlockSize, removeFromBlock } = require("../controller/block_controller");
const { authentication } = require("../util/util");

// get nest data for front-end sidebar
router.route("/block/details").get(authentication(), getDivData);
router.route("/block/size").post(authentication(), updateBlockSize);
router.route("/block/update").post(authentication(), removeFromBlock);

module.exports = router;
