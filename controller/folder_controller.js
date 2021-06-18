const folder = require("../models/folder_models");
const cache = require("../util/cache");

function buildTree (list) {
  const temp = {};
  const tree = {};
  for (const i in list) {
    if (list[i].folder_id === "0") {
      list[i].folder_id = 0;
      temp[list[i].id] = list[i];
    } else {
      temp[list[i].id] = list[i];
    }
  }
  // console.log(temp);
  for (const i in temp) {
    if (temp[i].folder_id) {
      if (!temp[temp[i].folder_id].children) {
        // eslint-disable-next-line no-new-object
        temp[temp[i].folder_id].children = new Object();
      }
      temp[temp[i].folder_id].children[temp[i].id] = temp[i];
    } else {
      tree[temp[i].id] = temp[i];
    }
  }
  return tree;
}

const getNestData = async (req, res, next) => {
  const user = req.user.id;
  const data = await folder.sidebarData(user);
  const temp = buildTree(data);
  res.send(temp);
};

const getDivData = async (req, res) => {
  const { id } = req.query;
  const user = req.user.id;
  const data = await folder.getBlockData(user, id);
  const cacheData = await cache.get(user);
  const dataTrans = JSON.parse(cacheData);
  // console.log(data);
  const dataObj = { data: [] };
  for (const n of data) {
    const y = n.div_id;
    const x = dataObj.data.map((item) => {
      return item.div_id;
    }).indexOf(y);
    if (x === -1) {
      if (n.url) {
        dataObj.data.push({
          div_id: n.div_id,
          time: n.divTime,
          width: n.width,
          height: n.height,
          details: [{ id: n.bookmark_id, url: n.url, title: n.title, thumbnail: n.thumbnail, time: n.bookmarkTime }]
        });
      } else if (n.folder_name) {
        dataObj.data.push({
          div_id: n.div_id,
          time: n.divTime,
          width: n.width,
          height: n.height,
          details: [{ id: n.subfolder_id, folder_name: n.folder_name }]
        });
      } else {
        dataObj.data.push({
          div_id: n.div_id,
          time: n.divTime,
          width: n.width,
          height: n.height,
          details: [{ id: n.note_id, text: n.text }]
        });
      }
    } else {
      if (n.url) {
        dataObj.data[x].details.push({ id: n.bookmark_id, url: n.url, title: n.title, thumbnail: n.thumbnail, time: n.bookmarkTime });
      } else if (n.folder_name) {
        dataObj.data[x].details.push({ id: n.subfolder_id, folder_name: n.folder_name });
      } else {
        console.log(n.note_id);
        dataObj.data[x].details.push({ id: n.note_id, text: n.text });
      }
    }
  }
  dataObj.data.sort((a, b) => {
    if (a.time > b.time) {
      return 1;
    }
    if (a.time < b.time) {
      return -1;
    }
    return 0;
  });
  if (dataTrans) {
    const a = dataTrans.filter(el => el[1].folder_id === id);
    for (const n of dataObj.data.details) {
      for (const x of a) {
        if (x[0] === n.id) {
          n.text = x[1].text;
        }
      }
    }
  }
  console.log("checkout dataObj");
  // console.log(dataObj);
  res.status(200).send(dataObj);
};

const changeFolderName = async (req, res) => {
  const userId = req.user.id;
  const folderId = req.body.id;
  const name = req.body.name;
  await folder.changeFolderName(name, folderId, userId);
  res.status(200).json("updated");
};

const updateBlockSize = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  // console.log(data);
  await folder.updateBlockSize(data, userId);
};

const dropSidebarFolder = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const updateId = data.update_id;
  const folderId = data.folder_id;
  console.log(data);
  if (updateId === folderId) {
    res.status(400).send({ error: "Request Error: can't insert to the same folder!" });
    return;
  }
  const result = await folder.insertSidebarFolder(data, userId);
  if (result.error) {
    console.log("error");
    res.status(400).send({ error: result.error });
    return;
  }
  console.log("no error");
  res.status(200).send({ message: "updated" });
};

module.exports = { getNestData, getDivData, changeFolderName, updateBlockSize, dropSidebarFolder };
