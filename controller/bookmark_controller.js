const bookmark = require("../models/bookmark_model");
const cache = require("../util/cache");
const util = require("../util/util");

const getThumbnail = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const id = util.getRandomNumber();
    const time = util.getTimeStamp();
    const url = req.body.url.trim();
    const user = req.user.id;
    if (!url || !(url.trim())) {
      res.status(400).json({ error: "url is required!" });
      return;
    }
    const cacheKey = "url" + user;
    if (cache.client.ready) {
      const prevUrl = JSON.parse(await cache.get(cacheKey));
      if (prevUrl) {
        if (prevUrl === url) {
          res.status(400).json({ error: "duplicated url" });
          return;
        } else {
          await cache.set(cacheKey, JSON.stringify(url));
        }
      } else {
        await cache.set(cacheKey, JSON.stringify(url));
      }
    }
    const check = await bookmark.checkUrl(url);
    if (check.error) {
      res.status(400).json({ error: "duplicated url" });
      return;
    }
    // get url title => check if status = done
    // if not => call API every 3's util the status is done
    const titleData = await bookmark.getTitle(url);
    if (titleData.status === "error") {
      res.status(401).json({ error: "wrong format" });
      return;
    }
    if (titleData.status !== "done") {
      let insert;
      if (!req.body.parent_id) {
        insert = { id: id, user_id: user, url: url, timestamp: time, remove: 0 };
      } else {
        insert = { id: id, user_id: user, folder_id: req.body.parent_id, url: url, timestamp: time, remove: 0 };
      }
      await bookmark.insertBookmark(insert);
      const test = async function () {
        const titleData = await bookmark.getTitle(url);
        if (titleData.status === "done") {
          clearInterval(this);
          const title = titleData.title;
          const location = await bookmark.uploadS3(url, time);
          await bookmark.updateBookmark(title, location, id);
          const msg = { id: id, title: title, thumbnail: location };
          const socketId = await cache.get(`${"socketId" + user}`);
          io.to(socketId).emit("done", msg);
        }
      };
      setInterval(test, 6000);
      res.status(200).json({ id: id });
    } else {
      let insert;
      const title = titleData.title;
      const location = await bookmark.uploadS3(url, time);
      if (!req.body.parent_id) {
        insert = { id: id, user_id: user, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
      } else {
        insert = { id: id, user_id: user, folder_id: req.body.parent_id, url: url, title: title, thumbnail: location, timestamp: time, remove: 0 };
      }
      await bookmark.insertBookmark(insert);
      res.status(200).json({ data: [{ id: id, title: title, thumbnail: location }] });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// container.html get the folders and the bookmarks data
const containerData = async (req, res, next) => {
  const { id } = req.query;
  const user = req.user.id;
  console.log(user);
  const dataObj = { data: [] };
  let data;
  if (id === undefined) {
    data = await bookmark.getMainData(user);
  } else {
    const receiveData = await bookmark.getSubfolderData(id, user);
    const note = await bookmark.getStickyNote(id, user);
    const cacheData = await cache.get(user);
    const dataTrans = JSON.parse(cacheData);
    if (dataTrans) {
      const folderData = dataTrans.filter(el => el[1].folder_id === id);
      for (const child of note) {
        for (const content of folderData) {
          if (content[0] === child.id) {
            child.text = content[1].text;
          }
        }
      }
    }
    data = [...receiveData, ...note];
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
    // console.log(n.folder_name);
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

// create folder, stickyNote
const createItem = async (req, res, next) => {
  try {
    const id = util.getRandomNumber();
    const time = util.getTimeStamp();
    const folderId = req.body.folder_id;
    const type = req.body.type;
    const user = req.user.id;
    let insert;
    if (type === "folder") {
      insert = { id: id, user_id: user, folder_name: "folder", folder_id: folderId, timestamp: time, remove: 0 };
    } else if (type === "stickyNote") {
      insert = { id: id, user_id: user, folder_id: folderId, timestamp: time, remove: 0 };
    }
    await bookmark.createItem(type, insert);
    res.status(200).json({ id: id });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

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

module.exports = { getThumbnail, containerData, createItem, sequenceChange, insertIntoSubfolder, updateBlock, removeItem };
