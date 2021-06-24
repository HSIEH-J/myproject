const search = require("../models/search_model");
const validator = require("validator");

async function getParentName (folderId) {
  const parent = await search.getSearchItemParent(folderId);
  parent.reverse();
  const parents = ["homepage"];
  parent.forEach(el => parents.push(" > " + el.folder_name));
  const parentName = parents.join("");
  return parentName;
}

const getSearchItem = async (req, res, next) => {
  try {
    const user = req.user.id;
    const { select } = req.params;
    const { keyword } = req.query;
    const selectCheck = select.trim();
    if (selectCheck !== "bookmark" && selectCheck !== "folder" && selectCheck !== "stickyNote" && selectCheck !== "all") {
      res.status(401).json({ error: "The operation could not be completed" });
      return;
    }
    if (!select || !keyword || validator.isEmpty(select) || validator.isEmpty(keyword)) {
      res.status(400).json({ error: "params is required" });
      return;
    }
    async function getSearchData (select) {
      switch (select) {
        case "bookmark": {
          const result = await search.getSearchItem("bookmark", user, keyword);
          const dataObj = { data: [] };
          for (const bookmark of result) {
            if (bookmark.folder_id) {
              const parentName = await getParentName(bookmark.folder_id);
              dataObj.data.push({ type: "bookmark", id: bookmark.id, url: bookmark.url, title: bookmark.title, thumbnail: bookmark.thumbnail, parent: parentName });
            } else {
              dataObj.data.push({ type: "bookmark", id: bookmark.id, url: bookmark.url, title: bookmark.title, thumbnail: bookmark.thumbnail });
            }
          }
          return dataObj;
        }
        case "folder": {
          const result = await search.getSearchItem("folder", user, keyword);
          console.log(result);
          const dataObj = { data: [] };
          for (const folder of result) {
            if (folder.folder_id !== "0") {
              const parentName = await getParentName(folder.folder_id);
              dataObj.data.push({ type: "folder", id: folder.id, folder_name: folder.folder_name, parent: parentName });
            } else {
              dataObj.data.push({ type: "folder", id: folder.id, folder_name: folder.folder_name });
            }
          }
          return dataObj;
        }
        case "stickyNote": {
          const result = await search.getSearchItem("stickyNote", user, keyword);
          const dataObj = { data: [] };
          for (const note of result) {
            if (note.folder_id) {
              const parentName = await getParentName(note.folder_id);
              dataObj.data.push({ type: "stickyNote", id: note.id, text: note.text, parent: parentName });
            } else {
              dataObj.data.push({ type: "stickyNote", id: note.id, text: note.text });
            }
          }
          return dataObj;
        }
        case "all": {
          const result = await search.getSearchItem("all", user, keyword);
          console.log(result);
          const dataObj = { data: [] };
          for (const item of result) {
            if (item.folder_id || item.folder_id !== "0") {
              const parentName = await getParentName(item.folder_id);
              if (item.url) {
                dataObj.data.push({ type: "bookmark", id: item.id, url: item.url, title: item.title, thumbnail: item.thumbnail, parent: parentName });
              } else if (item.folder_name) {
                dataObj.data.push({ type: "folder", id: item.id, folder_name: item.folder_name, parent: parentName });
              } else {
                dataObj.data.push({ type: "stickyNote", id: item.id, text: item.text, parent: parentName });
              }
            } else {
              if (item.url) {
                dataObj.data.push({ type: "bookmark", id: item.id, url: item.url, title: item.title, thumbnail: item.thumbnail });
              } else if (item.folder_name) {
                dataObj.data.push({ type: "folder", id: item.id, folder_name: item.folder_name });
              } else {
                dataObj.data.push({ type: "stickyNote", id: item.id, text: item.text });
              }
            }
          }
          return dataObj;
        }
      }
    }
    const searchData = await getSearchData(select);
    res.status(200).json(searchData);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getSearchItem };
