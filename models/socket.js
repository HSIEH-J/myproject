let io;

module.exports = {
  init: (server) => {
    console.log("init");
    io = require("socket.io")(server);
    return io;
  },
  get: () => {
    console.log("get");
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }
};
