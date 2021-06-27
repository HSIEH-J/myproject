const router = require("express").Router();
const { signUp, nativeSignIn } = require("../controller/user_controller");

router.route("/user/signup").post(signUp);
router.route("/user/login").post(nativeSignIn);

module.exports = router;
