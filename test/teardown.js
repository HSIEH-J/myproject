const { closeConnection } = require("./fake_data_generator");
const { requester } = require("./set_up");

// eslint-disable-next-line no-undef
after(async () => {
  await closeConnection();
  requester.close();
});
