const bookmark = require("../models/bookmark_model");

// when user insert a url
const importThumbnailData = async (req, res, next) => {
  const socket = req.app.get("socket");
  // try {
  // get url
  const url = req.body.url;
  const time = req.body.time;
  const user = req.user.id;
  const titleData = await bookmark.getTitle(url);
  console.log(titleData);
  // get url title => check if status = done
  // if not => get API every 3's util the status is done
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
        const location = await bookmark.uploadS3(url);
        console.log(location);
        const insert = { user_id: user, url: url, title: title, thumbnail: location, timestamp: time };
        await bookmark.insertContainerData(insert);
        console.log(socket.id);
        socket.emit("done");
      }
    };
    setInterval(test, 6000);
    res.send(false);
  } else {
    const title = titleData.title;
    console.log(title);
    const location = await bookmark.uploadS3(url);
    console.log(location);
    const insert = { user_id: user, url: url, title: title, thumbnail: location, timestamp: time };
    await bookmark.insertContainerData(insert);
    res.send(true);
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
    data = mark[0].concat(folder[0]);
  } else {
    const mark = await bookmark.getSubfolderBookmarkData(id, user);
    const folder = await bookmark.getSubfolderData(id, user);
    data = mark.concat(folder);
  }
  // console.log(data);
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
    if (n.folder_name === undefined) {
      dataObj.data.push({ id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail });
    } else {
      dataObj.data.push({ id: n.id, folder_name: n.folder_name });
    }
  }
  res.send(dataObj);
};

// when user create a new folder
const createFolder = async (req, res, next) => {
  const name = req.body.name;
  const time = req.body.time;
  const id = req.body.folder_id;
  const user = req.user.id;
  const insert = { id: time, user_id: user, folder_name: name, folder_id: id, timestamp: time };
  await bookmark.createFolder(insert);
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

// when user drag a folder or a bookmark into a folder

module.exports = { importThumbnailData, containerData, createFolder, sequenceChange, insertIntoSubfolder };
