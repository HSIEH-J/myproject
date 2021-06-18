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
    // if not => call API every 6's util the status is done
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
const getContentData = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = req.user.id;
    const response = { data: [] };
    let data;
    if (!id) {
      data = await bookmark.getMainData(user);
    } else {
      const receiveData = await bookmark.getSubfolderData(id);
      const noteData = await bookmark.getStickyNote([id], { type: "getSubfolderData" });
      const cacheData = await cache.get(user);
      const dataTrans = JSON.parse(cacheData);
      if (dataTrans) {
        const folderData = dataTrans.filter(el => el[1].folder_id === id);
        util.getCacheStickyNoteData(noteData, folderData);
      }
      data = [...receiveData, ...noteData];
    }
    util.sortData(data);
    data.forEach(item => {
      if (item.url) {
        response.data.push({ type: "bookmark", id: item.id, url: item.url, title: item.title, thumbnail: item.thumbnail });
      } else if (item.folder_name) {
        response.data.push({ type: "folder", id: item.id, folder_name: item.folder_name });
      } else {
        response.data.push({ type: "stickyNote", id: item.id, text: item.text });
      }
    });
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// create folder, stickyNote, block
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
    } else if (type === "stickyNote" || type === "block") {
      insert = { id: id, user_id: user, folder_id: folderId, timestamp: time, remove: 0 };
    }
    const result = await bookmark.createItem(type, insert);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ id: id });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const sequenceChange = async (req, res, next) => {
  try {
    const data = req.body.data;
    const user = req.user.id;
    const result = await bookmark.sequenceChange(data, user);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "succeed" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// when user drag a folder or a bookmark into another folder or a block
const insertIntoAnotherItem = async (req, res, next) => {
  try {
    const data = req.body;
    const user = req.user.id;
    console.log(data);
    const result = await bookmark.insertIntoAnotherItem(data, user);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "inserted" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeFromBlock = async (req, res, next) => {
  try {
    const data = req.body;
    const user = req.user.id;
    console.log(data);
    const result = await bookmark.removeFromBlock(data, user);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const type = req.body.type;
    const id = req.body.id;
    const user = req.user.id;
    const result = await bookmark.removeItem(type, id);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "removed" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// when user drag a folder or a bookmark into a folder

module.exports = { getThumbnail, getContentData, createItem, sequenceChange, insertIntoAnotherItem, removeFromBlock, removeItem };
