const express = require("express");
const app = express();
const cache = require("./util/cache");
// env
require("dotenv").config();

app.set("json spaces", 2);

// set port
const port = process.env.PORT;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/1.0",
  [
    require("./routes/bookmark_route"),
    require("./routes/folder_route"),
    require("./routes/user_route")
  ]
);

// socket i.o
const http = require("http");
const server = http.createServer(app);

const io = require("./models/socket").init(server);

// const dataObj = { data: [] };
// app.set("io", io);
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Connection disconnected", socket.id);
  });
  socket.on("stickyNote", (msg) => {
    console.log(msg);
    const key = msg.id.toString();
    const data = { user: 2, id: msg.id, text: msg.text, time: msg.time };
    if (cache.client.ready) {
      cache.set(key, JSON.stringify(data));
    }
  });
  app.set("socket", socket);
});

// eslint-disable-next-line node/handle-callback-err
app.use((err, req, res, next) => {
  res.status(500).send("server error");
});

server.listen(port, () => {
  console.log(`bookmark app.js is listening on port ${port}...`);
});
