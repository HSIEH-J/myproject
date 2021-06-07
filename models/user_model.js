const bcrypt = require("bcrypt");
const salt = parseInt(process.env.BCRYPT_SALT);
// const crypto = require("crypto");
const { pool } = require("./mysql");
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

// const token_secret = crypto.randomBytes(64).toString("hex");

const signUp = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const emails = await conn.query("SELECT email FROM user WHERE email = ?", email);
    if (emails[0].length > 0) {
      await conn.query("COMMIT");
      return { error: "Email Already Exists" };
    }
    const user = {
      provider: "native",
      email: email,
      password: bcrypt.hashSync(password, salt)
    };
    // const accessToken = jwt.sign({ provider: user.provider, email: user.email }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE });
    const insert = "INSERT INTO user SET ?";
    const result = await conn.query(insert, user);
    user.id = result[0].insertId;
    const accessToken = jwt.sign({ id: user.id, provider: user.provider, email: user.email }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE });
    user.access_token = accessToken;
    await conn.query("COMMIT");
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const users = await conn.query("SELECT * FROM user WHERE email = ?", [email]);
    const user = users[0][0];
    const id = user.id;
    if (!bcrypt.compareSync(password, user.password)) {
      await conn.query("COMMIT");
      return { error: "Password is wrong" };
    }
    const accessToken = jwt.sign({ id: id, provider: user.provider, email: user.email }, TOKEN_SECRET);
    await conn.query("COMMIT");
    user.access_token = accessToken;
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getUserDetail = async (email) => {
  const detail = await pool.query("SELECT * FROM user WHERE email = ?", email);
  return detail[0];
};

module.exports = { signUp, nativeSignIn, getUserDetail };
