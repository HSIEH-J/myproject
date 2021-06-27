const { changeName } = require("../models/folder_model");
const { verifyUserData } = require("../models/item_model");
const validator = require("validator");

const changeFolderName = async (req, res, next) => {
  try {
    const user = req.user.id;
    const folderId = req.body.id;
    const name = req.body.name;
    // confirm whether the folder belongs to the user
    const checkQualification = await verifyUserData(user, folderId, "folder");
    if (checkQualification.length === 0) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
    if (validator.isEmpty(name)) {
      res.status(400).send({ error: "folder name is required" });
    }
    await changeName(name, folderId);
    res.status(200).json({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { changeFolderName };
