const { getBlockData, updateSize, removeItem } = require("../models/block_model");
const { verifyUserData } = require("../models/item_model");
const cache = require("../util/cache");

const getDivData = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = req.user.id;
    const data = await getBlockData(id, user);
    if (data.error) {
      throw new Error(data.error);
    }
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const updateBlockSize = async (req, res, next) => {
  try {
    const user = req.user.id;
    const data = req.body;
    // confirm whether the block belongs to the user
    const checkQualification = await verifyUserData(user, data.id, "block");
    if (checkQualification.length === 0) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
    await updateSize(data);
    res.status(200).json({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeFromBlock = async (req, res, next) => {
  try {
    const data = req.body;
    const user = req.user.id;
    cache.del(`url+${user}`);
    const result = await removeItem(data);
    if (result.error) {
      throw new Error(result.error);
    }
    res.status(200).json({ message: "updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getDivData, updateBlockSize, removeFromBlock };
