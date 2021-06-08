const bookmark = require("../models/bookmark_model");
const cache = require("../util/cache");

// when user insert a url
const importThumbnailData = async (req, res, next) => {
  const socket = req.app.get("socket");
  // try {
  // get url
  const url = req.body.url;
  const time = req.body.time;
  const user = req.user.id;
  console.log(req.body);
  // if (cache.client.ready) {
  //   await cache.set("url", JSON.stringify(url));
  // }
  let insert;
  const titleData = await bookmark.getTitle(url);
  console.log(titleData);
  // get url title => check if status = done
  // if not => get API every 3's util the status is done
  if (titleData.status === "error") {
    res.status(401).json("wrong format");
    return;
  }
  if (titleData.status !== "done") {
    const test = async function () {
      let titleData = await bookmark.getTitle(url);
      console.log(titleData);
      if (titleData.status !== "done") {
        console.log("===setTimeout===");
        titleData = await bookmark.getTitle(url);
        console.log(titleData);
      } else {
        clearInterval(this);
        const title = titleData.title;
        console.log(title);
        const location = await bookmark.uploadS3(url, time);
        console.log(location);
        if (!req.body.parent_id) {
          console.log("no folder id");
          insert = { id: req.body.id, user_id: user, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
        } else {
          console.log("folder id");
          insert = { id: req.body.id, user_id: user, folder_id: req.body.parent_id, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
        }
        const result = await bookmark.insertContainerData(insert);
        console.log(result[0]);
        // console.log(id);
        console.log(socket.id);
        const msg = { id: req.body.id, title: title, thumbnail: location };
        const socketId = await cache.get(`${"socketId" + user}`);
        console.log(socketId);
        socket.to(socketId).emit("done", msg);
      }
    };
    setInterval(test, 6000);
    res.status(200).json("waiting for incoming thumbnail");
  } else {
    const title = titleData.title;
    console.log(title);
    const location = await bookmark.uploadS3(url, time);
    console.log(location);
    if (!req.body.parent_id) {
      insert = { id: req.body.id, user_id: user, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
    } else {
      insert = { id: req.body.id, user_id: user, folder_id: req.body.parent_id, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
    }
    await bookmark.insertContainerData(insert);
    const msg = { id: req.body.id, title: title, thumbnail: location };
    const socketId = await cache.get(`${"socketId" + user}`);
    console.log("done");
    console.log(socketId);
    socket.to(socketId).emit("done", msg);
    res.status(200).json("bookmark generated");
  }

  // } catch (err) {
  //   next(err);
  // }
};

// container.html get the folders and the bookmarks
const containerData = async (req, res, next) => {
  const { id } = req.query;
  const user = req.user.id;
  console.log(user);
  const dataObj = { data: [] };
  let data;
  if (id === undefined) {
    const mark = await bookmark.getContainerData(user);
    const folder = await bookmark.getFolderData(user);
    data = mark.concat(folder);
  } else {
    const mark = await bookmark.getSubfolderBookmarkData(id, user);
    const folder = await bookmark.getSubfolderData(id, user);
    const note = await bookmark.getSubfolderStickyNote(id, user);
    const cacheData = await cache.get(user);
    const dataTrans = JSON.parse(cacheData);
    if (dataTrans) {
      const a = dataTrans.filter(el => el[1].folder_id === id);
      for (const n of note) {
        for (const x of a) {
          if (x[0] === n.id) {
            n.text = x[1].text;
          }
        }
      }
    }
    data = mark.concat(folder, note);
  }
  data.sort((a, b) => {
    if (a.timestamp > b.timestamp) {
      return 1;
    }
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    return 0;
  });
  // console.log(data);
  for (const n of data) {
    console.log(n.folder_name);
    if (n.url) {
      dataObj.data.push({ id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail });
    } else if (n.folder_name) {
      dataObj.data.push({ id: n.id, folder_name: n.folder_name });
    } else {
      dataObj.data.push({ id: n.id, text: n.text, width: n.width, height: n.height });
    }
  }
  res.send(dataObj);
};

// when user create a new folder
const insertItem = async (req, res, next) => {
  console.log(req.body);
  const id = req.body.id;
  const time = req.body.time;
  const folderId = req.body.folder_id;
  const type = req.body.type;
  console.log(id);
  const user = req.user.id;
  let insert;
  if (type === "folder") {
    const name = req.body.name;
    insert = { id: id, user_id: user, folder_name: name, folder_id: folderId, timestamp: time, remove: 0 };
  } else if (type === "stickyNote") {
    insert = { id: id, user_id: user, folder_id: folderId, timestamp: time, remove: 0 };
  }
  await bookmark.createItem(type, insert);
  res.status(200).json("inserted");
};

// when user drag a folder or a bookmark
const sequenceChange = async (req, res, next) => {
  const data = req.body.data;
  const user = req.user.id;
  // console.log(data);
  await bookmark.sequenceChange(data, user);
};

// when user drag a folder or a bookmark into another folder or a block
const insertIntoSubfolder = async (req, res, next) => {
  const data = req.body;
  const user = req.user.id;
  console.log(data);
  await bookmark.insertIntoSubfolder(data, user);
};

const updateBlock = async (req, res) => {
  const data = req.body;
  const user = req.user.id;
  console.log(data);
  await bookmark.updateBlock(data, user);
  res.status(200).send("updated");
};

const removeItem = async (req, res) => {
  const type = req.body.type;
  const user = req.user.id;
  const id = req.body.id;
  console.log(req.body);
  await bookmark.removeAllItem(type, id, user);
  res.status(200).json("removed");
};

// when user drag a folder or a bookmark into a folder

module.exports = { importThumbnailData, containerData, insertItem, sequenceChange, insertIntoSubfolder, updateBlock, removeItem };
