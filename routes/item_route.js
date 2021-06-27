const router = require("express").Router();
const { getContentData, createItem, sequenceChange, insertIntoAnotherItem, removeItem } = require("../controller/item_controller");
const { authentication } = require("../util/util");

// get first level data
router.route("/item/details").get(authentication(), getContentData);
// create folder data
router.route("/item/create").post(authentication(), createItem);
// change sequence
router.route("/item/sequence").post(authentication(), sequenceChange);
// drop into another folder
router.route("/item/insert").post(authentication(), insertIntoAnotherItem);

router.route("/item/remove").post(authentication(), removeItem);

module.exports = router;
