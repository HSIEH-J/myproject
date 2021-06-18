const express = require("express");
const app = express();
const cache = require("./util/cache");
const cors = require("cors");

app.use(cors());
// env
require("dotenv").config();

// token authentication
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

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
    require("./routes/user_route"),
    require("./routes/search_route")
  ]
);

// socket i.o
const http = require("http");
const server = http.createServer(app);

const io = require("./models/socket").init(server);

// const dataObj = { data: [] };
app.set("io", io);
io.use((socket, next) => {
  const { token } = socket.handshake.auth;
  if (token === null) {
    const err = new Error("尚未登入");
    next(err);
  } else {
    jwt.verify(token, TOKEN_SECRET, (err, result) => {
      if (err) {
        const err = new Error("登入失敗");
        next(err);
      } else {
        socket.info = result;
        next();
      }
    });
  }
});
const cacheMap = new Map();
io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);
  if (cache.client.ready) {
    const key = "socketId" + socket.info.id;
    console.log(key);
    console.log(socket.id);
    await cache.set(key, socket.id);
  }
  console.log(socket.info.id);
  socket.on("disconnect", async () => {
    console.log("Connection disconnected", socket.id);
    console.log(socket.info.id);
    const id = socket.info.id;
    if (cache.client.ready) {
      const data = await cache.get(id);
      if (data) {
        // console.log(data);
        const receiveData = JSON.parse(data);
        await require("./models/folder_models").updateStickyNote(receiveData, id);
        await cache.del(id);
      }
    }
  });
  socket.on("stickyNote", (msg) => {
    // console.log(socket.info);
    console.log(msg);
    const key = socket.info.id.toString();
    const stickyNoteId = msg.id;
    cacheMap.set(stickyNoteId, { folder_id: msg.folder_id, text: msg.text });
    const allData = Array.from(cacheMap);
    // data.push[stickyNoteId] = msg.text;

    if (cache.client.ready) {
      cache.set(key, JSON.stringify(allData));
    }
  });
  socket.on("sequence", (msg) => {
    // console.log(msg);
    const key = socket.info.id.toString();
    const keyName = "sequence" + key;
    console.log(keyName);
    if (cache.client.ready) {
      cache.set(keyName, JSON.stringify(msg));
    }
  });
  app.set("socket", socket);
});

// eslint-disable-next-line node/handle-callback-err
app.use((err, req, res, next) => {
  console.log("app err");
  res.status(500).send({ error: "server error" });
});

server.listen(port, () => {
  console.log(`bookmark app.js is listening on port ${port}...`);
});
