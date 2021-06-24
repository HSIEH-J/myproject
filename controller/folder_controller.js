const folder = require("../models/folder_models");

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
  try {
    const user = req.user.id;
    const data = await folder.sidebarData(user);
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

const getDivData = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = req.user.id;
    const data = await folder.getBlockData(id, user);
    if (data.error) {
      throw new Error(data.error);
    }
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const changeFolderName = async (req, res, next) => {
  try {
    const user = req.user.id;
    const folderId = req.body.id;
    const name = req.body.name;
    // confirm whether the folder belongs to the user
    const checkQualification = await folder.verifyUserData(user, folderId, "folder");
    if (checkQualification.length === 0) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
    await folder.changeFolderName(name, folderId);
    res.status(200).json({ message: "updated" });
  } catch (err) {
    next(err);
  }
};

const updateBlockSize = async (req, res, next) => {
  try {
    const user = req.user.id;
    const data = req.body;
    // confirm whether the block belongs to the user
    const checkQualification = await folder.verifyUserData(user, data.id, "block");
    if (checkQualification.length === 0) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
    await folder.updateBlockSize(data);
    res.status(200).json({ message: "updated" });
  } catch (err) {
    next(err);
  }
};

const dropSidebarFolder = async (req, res, next) => {
  try {
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
      res.status(400).send({ error: result.error });
      return;
    }
    res.status(200).send({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getNestData, getDivData, changeFolderName, updateBlockSize, dropSidebarFolder };
