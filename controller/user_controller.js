const users = require("../models/user_model");
const validator = require("validator");

const signUp = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ error: "Request Error: email and password are required." });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Request Error: Invalid email format" });
    return;
  }
  const result = await users.signUp(email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }
  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }
  res.cookie("token", user.access_token);
  res.status(200).send({
    data: { access_token: user.access_token }
  });
};

const nativeSignIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ error: "Request Error: email and password are required." });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Request Error: Invalid email format" });
    return;
  }
  const result = await users.nativeSignIn(email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }
  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }
  res.cookie("token", user.access_token);
  res.status(200).send({ data: { access_token: user.access_token } });
};

module.exports = { signUp, nativeSignIn };
