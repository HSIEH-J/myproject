const e = require("express");
const folder = require("../models/folder_models");

function buildTree (list) {
  const temp = {};
  const tree = {};
  for (const i in list) {
    temp[list[i].id] = list[i];
  }
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

const getAllFolders = async (req, res) => {
  const id = req.user.id;
  const folders = await folder.getAllFolders(id);
  const data = [];
  for (const n of folders) {
    data.push({ folder_id: n.id, name: n.folder_name });
  }
  res.json(data);
};

const insertDivTable = async (req, res) => {
  const id = req.user.id;
  const data = { id: req.body.div_id, user_id: id, folder_id: req.body.folder_id, timestamp: req.body.time };
  await folder.insertDivTable(data);
};

const getDivData = async (req, res) => {
  const { id } = req.query;
  const user = req.user.id;
  const data = await folder.getBlockData(user, id);
  // console.log(data);
  const dataObj = { data: [] };
  for (const n of data) {
    const y = n.div_id;
    const x = dataObj.data.map((item) => {
      return item.div_id;
    }).indexOf(y);
    if (x === -1) {
      if (!n.folder_name) {
        dataObj.data.push({
          div_id: n.div_id,
          time: n.divTime,
          details: [{ id: n.bookmark_id, url: n.url, title: n.title, thumbnail: n.thumbnail, time: n.bookmarkTime }]
        });
      } else {
        dataObj.data.push({
          div_id: n.div_id,
          time: n.divTime,
          details: [{ id: n.subfolder_id, folder_name: n.folder_name }]
        });
      }
    } else {
      if (!n.folder_name) {
        dataObj.data[x].details.push({ id: n.bookmark_id, url: n.url, title: n.title, thumbnail: n.thumbnail, time: n.bookmarkTime });
      } else {
        dataObj.data[x].details.push({ id: n.subfolder_id, folder_name: n.folder_name });
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
  console.log("checkout dataObj");
  console.log(dataObj);
  res.status(200).send(dataObj);
};

module.exports = { getNestData, getAllFolders, insertDivTable, getDivData };
