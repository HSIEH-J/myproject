/* eslint-disable no-undef */
page.addEventListener("dragstart", (e) => {
//   console.log(page.getElementsByTagName("div")[0]);
  console.log("dragStart");
  console.log(e.target);
  const nodes = Array.prototype.slice.call(page.children);
  const index = nodes.indexOf(e.target);
  console.log(index);
  e.dataTransfer.setData("text/plain", index);
});

function order (arr) {
  const data = { data: [] };
  for (const n in arr) {
    const timestamp = getTimeStamp();
    const time = parseInt(timestamp) + parseInt(n);
    if (arr[n].className === "frame folderItem") {
      data.data.push({ type: "folder", id: arr[n].id, order: n, time: time });
    } else {
      data.data.push({ type: "bookmark", id: arr[n].id, order: n, time: time });
    }
  }
  return data;
}

const sequenceUpdate = async (data) => {
  const response = await fetch("/api/1.0/change", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

const insertSubFolder = async (data) => {
  const response = await fetch("/api/1.0/subfolder", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

const updatePageDiv = async (data) => {
  const response = await fetch("/api/1.0/update", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

page.addEventListener("drop", (e) => {
  console.log("dropped");
  cancelDefault(e);
  console.log(e.target);
  console.log(e.target.className);
  // get new and old index
  if (e.dataTransfer.getData("data")) {
    console.log(e.dataTransfer.getData("data"));
    const data = JSON.parse(e.dataTransfer.getData("data"));
    console.log(data.draggedId);
    let type;
    if (data.draggedType === "frame folderItem") {
      type = "folder";
    } else {
      type = "bookmark";
    }
    if (e.target.className === "frame folderItem") {
      const subfolder = { type: type, update_id: data.draggedId, folder_id: e.target.id, time: getTimeStamp() };
      console.log(subfolder);
      insertSubFolder(subfolder).then(data => {
        const response = data;
        console.log(response);
      });
      const blockParent = document.getElementById(data.block_id);
      blockParent.removeChild(document.getElementById(data.draggedId));
    } else {
      page.appendChild(document.getElementById(data.draggedId));
      const updateData = { type: type, update_id: data.draggedId, time: getTimeStamp() };
      updatePageDiv(updateData).then(data => {
        console.log(data);
      });
    }
  } else {
    const nodes = Array.prototype.slice.call(page.children);
    console.log(nodes);
    console.log(e.dataTransfer.getData("text/plain"));
    const oldIndex = e.dataTransfer.getData("text/plain");
    let target;
    const className = e.target.className;
    if (className === "frame folderItem" || className === "frame bookmark") {
      target = e.target;
    } else if (className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else {
      target = e.target.parentElement.parentElement;
    }
    const newIndex = nodes.indexOf(target);
    console.log(newIndex);
    const newChild = page.children[newIndex];
    const oldChild = page.children[oldIndex];
    // remove element if old Element = bookmark and new Element = carton
    if (newChild.className === "frame folderItem" && newChild.id !== oldChild.id) {
      console.log(page.children[oldIndex]);
      const className = oldChild.className;
      console.log(className);
      let type;
      if (className === "frame folderItem") {
        type = "folder";
      } else {
        type = "bookmark";
      }
      const timestamp = getTimeStamp();
      const subfolder = { type: type, update_id: oldChild.id, folder_id: newChild.id, time: timestamp };
      insertSubFolder(subfolder).then(data => {
        const response = data;
        console.log(response);
      });
      page.removeChild(oldChild);
    } else {
    // set new sequence
      const parentDiv = target.parentNode;
      if (newIndex < oldIndex) {
        parentDiv.insertBefore(oldChild, newChild);
      } else {
      // parentDiv.insertBefore(page.children[newIndex], page.children[oldIndex]);
        insertAfter(parentDiv, oldChild, newChild);
      }

      const nodes2 = Array.prototype.slice.call(page.children);
      console.log(nodes2);
      const orderData = order(nodes2);
      console.log(orderData);
      sequenceUpdate(orderData).then(data => {
        const response = data;
        console.log(response);
      });
    }
  }
});

page.addEventListener("dragenter", cancelDefault);
page.addEventListener("dragover", cancelDefault);

dataArea.addEventListener("dragstart", (e) => {
  console.log("dragstart");
  console.log(e.target.className);
  console.log(e.target.parentNode);
  const id = e.target.parentNode.id;
  const dataObj = { origin: "block", block_id: id, draggedId: e.target.id, draggedType: e.target.className };
  e.dataTransfer.setData("data", JSON.stringify(dataObj));
});

// drop into a block
dataArea.addEventListener("drop", (e) => {
  console.log("dropped");
  console.log(e.target.parentNode);
  console.log(e.target);
  let target;
  let type;
  let divId;
  if (e.dataTransfer.getData("text/plain")) {
    const oldIndex = e.dataTransfer.getData("text/plain");
    const oldChild = page.children[oldIndex];
    const className = oldChild.className;
    if (e.target.className === "frame folderItem" || e.target.className === "frame bookmark" || e.target.className === "block") {
      target = e.target;
    } else if (e.target.className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else {
      target = e.target.parentElement.parentElement;
    }
    if (target.className === "block") {
      divId = target.id;
    } else {
      divId = target.parentNode.id;
    }
    console.log("plain text index");
    console.log(divId);
    const blockLength = document.getElementById(divId).children.length;
    console.log(typeof (blockLength));
    if (blockLength === 6) {
      alert("Beyond limit! The board can only contain 6 items. Please create a new one!");
    } else {
      if (target.className === "frame folderItem" && target.id !== oldChild.id) {
        console.log(page.children[oldIndex]);
        if (className === "frame folderItem") {
          type = "folder";
        } else {
          type = "bookmark";
        }
        const timestamp = getTimeStamp();
        const subfolder = { type: type, update_id: oldChild.id, folder_id: target.id, time: timestamp };
        insertSubFolder(subfolder).then(data => {
          const response = data;
          console.log(response);
        });
        page.removeChild(oldChild);
      } else if (target.className === "block" || target.className === "block") {
        // get data from page
        target.appendChild(document.getElementById(oldChild.id));
        if (className === "frame folderItem") {
          type = "folder";
        } else {
          type = "bookmark";
        }
        console.log(type);
        console.log(divId);
        const blockData = { type: type, update_id: oldChild.id, div_id: divId, time: getTimeStamp() };
        console.log(blockData);
        insertSubFolder(blockData).then(data => {
          console.log(data);
        });
      }
    }
  } else {
    const data = JSON.parse(e.dataTransfer.getData("data"));
    console.log(data);
    const className = e.target.className;
    if (className === "frame folderItem" || className === "frame bookmark" || className === "block") {
      target = e.target;
    } else if (className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else {
      target = e.target.parentElement.parentElement;
    }
    console.log(target);
    if (className === "frame folderItem" && target.id !== data.draggedId) {
      if (data.draggedType === "frame folderItem") {
        type = "folder";
      } else {
        type = "bookmark";
      }
      const timestamp = getTimeStamp();
      const subfolder = { type: type, update_id: data.draggedId, folder_id: target.id, time: timestamp };
      insertSubFolder(subfolder).then(data => {
        const response = data;
        console.log(response);
      });
      const oldParent = document.getElementById(data.block_id);
      oldParent.removeChild(document.getElementById(data.draggedId));
    } else if (target.className === "block" || target.parentNode === "block") {
      // get data from page
      if (target.className === "block") {
        divId = target.id;
      } else {
        divId = target.parentNode.id;
      }
      target.appendChild(document.getElementById(data.draggedId));
      if (data.draggedType === "frame folderItem") {
        type = "folder";
      } else {
        type = "bookmark";
      }
      console.log(type);
      const blockData = { type: type, update_id: data.draggedId, div_id: divId, time: getTimeStamp() };
      console.log(blockData);
      insertSubFolder(blockData).then(data => {
        console.log(data);
      });
    } else {
      const blockParent = document.getElementById(target.parentNode.id);
      console.log(blockParent);
      console.log(target.id);
      const nodes = Array.prototype.slice.call(blockParent.children);
      console.log(nodes);
      const newIndex = nodes.indexOf(target);
      const oldChild = document.getElementById(data.draggedId);
      console.log(oldChild);
      const oldIndex = nodes.indexOf(oldChild);
      const parentDiv = target.parentNode;
      if (newIndex < oldIndex) {
        parentDiv.insertBefore(oldChild, target);
      } else {
      // parentDiv.insertBefore(page.children[newIndex], page.children[oldIndex]);
        insertAfter(parentDiv, oldChild, target);
      }

      const nodes2 = Array.prototype.slice.call(blockParent.children);
      console.log(nodes2);
      const orderData = order(nodes2);
      console.log(orderData);
      sequenceUpdate(orderData).then(data => {
        const response = data;
        console.log(response);
      });
    }
  }
});
dataArea.addEventListener("dragenter", cancelDefault);
dataArea.addEventListener("dragover", cancelDefault);

function cancelDefault (e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

function insertAfter (parent, oldElement, newElement) {
  if (parent.lastChild === newElement) { // 如果最後的節點是目標元素，則直接新增。因為預設是最後
    console.log("===last===");
    parent.appendChild(oldElement);
  } else {
    parent.insertBefore(oldElement, newElement.nextSibling);// 如果不是，則插入在目標元素的下一個兄弟節點的前面。也就是目標元素的後面。
  }
}
