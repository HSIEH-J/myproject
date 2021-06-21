/* eslint-disable no-undef */
const { assert, requester } = require("./set_up");
const { users } = require("./fake_data");
// const { PORT } = process.env;

const user1 = {
  email: users[0].email,
  password: users[0].password
};
let accessToken1;

describe("update block size", () => {
  before(async () => {
    const res1 = await requester
      .post("/api/1.0/login")
      .send(user1);
    const data1 = res1.body.data;
    accessToken1 = data1.access_token;
  });
  it("post width and height and update", async () => {
    const res = await requester
      .post("/api/1.0/size")
      .set("Authorization", `Bearer ${accessToken1}`)
      .send({
        id: 1,
        width: 100,
        height: 200
      });
    assert.equal(res.statusCode, 200);
  });
});
