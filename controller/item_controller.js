const all = require("../models/item_model");
const cache = require("../util/cache");
const util = require("../util/util");

// container.html get the folders and the bookmarks data
const getContentData = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = req.user.id;
    const response = { data: [] };
    let data;
    if (!id) {
      data = await all.getMainData(user);
    } else {
      // confirm whether the folder belongs to the user
      const checkQualification = await all.verifyUserData(user, id, "folder");
      if (checkQualification.length === 0) {
        res.status(403).send({ error: "Forbidden" });
        return;
      }
      const receiveData = await all.getSubfolderData(id);
      const noteData = await all.getStickyNote([id], { type: "getSubfolderData" });
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
    // confirm whether the folder belongs to the user
    if (folderId !== 0) {
      const checkQualification = await all.verifyUserData(user, folderId, "folder");
      if (checkQualification.length === 0) {
        res.status(403).send({ error: "Forbidden" });
        return;
      }
    }
    let insert;
    if (type === "folder") {
      insert = { id: id, user_id: user, folder_name: "folder", folder_id: folderId, timestamp: time, remove: 0 };
    } else if (type === "stickyNote" || type === "block") {
      insert = { id: id, user_id: user, folder_id: folderId, timestamp: time, remove: 0 };
    }
    const result = await all.createItem(type, insert);
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
    // const user = req.user.id;
    const result = await all.sequenceChange(data);
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
    const result = await all.insertIntoAnotherItem(data);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "inserted" });
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
    cache.del(`url+${user}`);
    const result = await all.removeItem(type, id);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "removed" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getContentData, createItem, sequenceChange, insertIntoAnotherItem, removeItem };
