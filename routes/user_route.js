const router = require("express").Router();
const { signUp, nativeSignIn } = require("../controller/user_controller");

router.route("/signup").post(signUp);
router.route("/login").post(nativeSignIn);

module.exports = router;
