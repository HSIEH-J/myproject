const { sidebarData, insertIntoSidebarFolder } = require("../models/sidebar_model");

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
  try {
    const user = req.user.id;
    const data = await sidebarData(user);
    if (data.error) {
      throw new Error(data.error);
    }
    const temp = buildTree(data);
    res.status(200).json(temp);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const dropSidebarFolder = async (req, res, next) => {
  try {
    const user = req.user.id;
    const data = req.body;
    const updateId = data.update_id;
    const folderId = data.folder_id;
    if (updateId === folderId) {
      res.status(400).send({ error: "can't insert to the same folder!" });
      return;
    }
    const result = await insertIntoSidebarFolder(data, user);
    if (result.error) {
      res.status(400).send({ error: result.error });
      return;
    }
    res.status(200).send({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getNestData, dropSidebarFolder };
