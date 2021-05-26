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
  const data = await folder.sidebarData();
  const temp = buildTree(data);
  res.send(temp);
};

module.exports = { getNestData };
