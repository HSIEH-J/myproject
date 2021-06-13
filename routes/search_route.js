const router = require("express").Router();
const { authentication } = require("../util/util");
const { getSearchItem } = require("../controller/search_controller");

router.route("/search/:select").get(authentication(), getSearchItem);

module.exports = router;
