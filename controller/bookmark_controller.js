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
    if (check.bookmark) {
      res.status(200).json({ data: [{ id: check.bookmark.id, title: check.bookmark.title, thumbnail: check.bookmark.thumbnail }] });
      return;
    }
    // get url title => check if status = done
    // if not => call API every 6's util the status is done
    const titleData = await bookmark.getTitle(url);
    if (titleData.status === "error") {
      res.status(400).json({ error: "wrong format" });
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

module.exports = { getThumbnail };
