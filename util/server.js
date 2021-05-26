const app = require("../app");

const http = require("http");

const server = http.createServer(app);
const io = require("../models/socket").init(server);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Connection disconnected", socket.id);
  });
});

// server.listen(4040, () => {
//   console.log("socket i.o is listening on port 4040...");
// });
