const search = require("../models/search_model");

async function getParentName (folderId) {
  const parent = await search.getSearchItemParent(folderId);
  const parentNum = parent.length;
  const parentNameArr = [];
  for (const x in parent) {
    const newIndex = parentNum - (parseInt(x) + 1);
    parentNameArr.push("/" + parent[newIndex].folder_name);
  }
  const parentName = parentNameArr.join("");
  return parentName;
}

const getSearchItem = async (req, res) => {
  const user = req.user.id;
  const { select } = req.params;
  const { keyword } = req.query;
  console.log(select);
  console.log(keyword);
  async function getSearchData (select) {
    switch (select) {
      case "bookmark": {
        const result = await search.getSearchItem("bookmark", user, keyword);
        const dataObj = { data: [] };
        for (const n of result) {
          if (n.folder_id) {
            const parentName = await getParentName(n.folder_id);
            dataObj.data.push({ type: "bookmark", id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail, parent: parentName });
          } else {
            dataObj.data.push({ type: "bookmark", id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail });
          }
        }
        return dataObj;
      }
      case "folder": {
        const result = await search.getSearchItem("folder", user, keyword);
        const dataObj = { data: [] };
        for (const n of result) {
          if (n.folder_id !== "0") {
            const parentName = await getParentName(n.folder_id);
            dataObj.data.push({ type: "folder", id: n.id, folder_name: n.folder_name, parent: parentName });
          } else {
            dataObj.data.push({ type: "folder", id: n.id, folder_name: n.folder_name });
          }
        }
        return dataObj;
      }
      case "stickyNote": {
        const result = await search.getSearchItem("stickyNote", user, keyword);
        const dataObj = { data: [] };
        for (const n of result) {
          if (n.folder_id) {
            const parentName = await getParentName(n.folder_id);
            dataObj.data.push({ type: "stickyNote", id: n.id, text: n.text, parent: parentName });
          } else {
            dataObj.data.push({ type: "stickyNote", id: n.id, text: n.text });
          }
        }
        return dataObj;
      }
      case "all": {
        const result = await search.getSearchItem("all", user, keyword);
        const dataObj = { data: [] };
        for (const n of result) {
          if (n.folder_id || n.folder_id !== "0") {
            const parentName = await getParentName(n.folder_id);
            if (n.url) {
              dataObj.data.push({ type: "bookmark", id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail, parent: parentName });
            } else if (n.folder_name) {
              dataObj.data.push({ type: "folder", id: n.id, folder_name: n.folder_name, parent: parentName });
            } else {
              dataObj.data.push({ type: "stickyNote", id: n.id, text: n.text, parent: parentName });
            }
          } else {
            if (n.url) {
              dataObj.data.push({ type: "bookmark", id: n.id, url: n.url, title: n.title, thumbnail: n.thumbnail });
            } else if (n.folder_name) {
              dataObj.data.push({ type: "folder", id: n.id, folder_name: n.folder_name });
            } else {
              dataObj.data.push({ type: "stickyNote", id: n.id, text: n.text });
            }
          }
        }
        return dataObj;
      }
    }
  }
  const searchData = await getSearchData(select);
  if (searchData.data.length === 0) {
    res.status(200).json({ data: [] });
    return;
  }
  res.status(200).send(searchData);
};

module.exports = { getSearchItem };
