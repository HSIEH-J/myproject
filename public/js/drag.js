/* eslint-disable no-undef */
page.addEventListener("dragstart", (e) => {
  const nodes = Array.prototype.slice.call(page.children);
  const index = nodes.indexOf(e.target);
  e.dataTransfer.setData("text/plain", index);
});

function order (arr) {
  const data = { data: [] };
  for (const n in arr) {
    const timestamp = getTimeStamp();
    const time = parseInt(timestamp) + parseInt(n);
    if (arr[n].className === "frame folderItem") {
      data.data.push({ type: "folder", id: arr[n].id, order: n, time: time });
    } else if (arr[n].className === "frame bookmark") {
      data.data.push({ type: "bookmark", id: arr[n].id, order: n, time: time });
    } else {
      data.data.push({ type: "stickyNote", id: arr[n].id, order: n, time: time });
    }
  }
  return data;
}

const sequenceUpdate = async (data) => {
  const response = await fetch("/api/1.0/item/sequence", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  if (response.status !== 200) {
    alert("There's something wrong...");
    throw new Error("error");
  }
  const json = await response.json();
  return json;
};

const insertIntoSubFolder = async (data) => {
  const response = await fetch("/api/1.0/item/insert", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  if (response.status !== 200) {
    alert("There's something wrong...");
    throw new Error("error");
  }
  const json = await response.json();
  return json;
};

const updatePageDiv = async (data) => {
  const response = await fetch("/api/1.0/block/update", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  if (response.status !== 200) {
    alert("There's something wrong...");
    throw new Error("error");
  }
  const json = await response.json();
  return json;
};

const dropSidebarFolder = async (data) => {
  const response = await fetch("/api/1.0/sidebar/drag", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  if (response.status === 400) {
    alert("The operation could not be completed");
    throw new Error("The operation could not be completed");
  }
  if (response.status !== 200) {
    alert("There's something wrong...");
    throw new Error("error");
  }
  const json = await response.json();
  return json;
};

page.addEventListener("drop", (e) => {
  cancelDefault(e);
  // get new and old index
  if (e.dataTransfer.getData("data")) {
    const data = JSON.parse(e.dataTransfer.getData("data"));
    let type;
    if (data.draggedType === "frame folderItem") {
      type = "folder";
    } else if (data.draggedType === "frame bookmark") {
      type = "bookmark";
    } else {
      type = "stickyNote";
    }
    if (e.target.className === "frame folderItem") {
      // sidebar change
      if (type === "folder") {
        const oldItem = document.getElementById(data.draggedId);
        const newItem = document.getElementById(e.target.id);
        sidebarFolderChange(oldItem, newItem);
      }
      const subfolder = { type: type, update_id: data.draggedId, folder_id: e.target.id, time: getTimeStamp() };
      insertIntoSubFolder(subfolder);
      const blockParent = document.getElementById(data.block_id);
      blockParent.removeChild(document.getElementById(data.draggedId));
    } else {
      page.appendChild(document.getElementById(data.draggedId));
      const updateData = { type: type, update_id: data.draggedId, time: getTimeStamp() };
      updatePageDiv(updateData);
    }
  } else {
    const nodes = Array.prototype.slice.call(page.children);
    const oldIndex = e.dataTransfer.getData("text/plain");
    let target;
    const className = e.target.className;
    if (className === "frame folderItem" || className === "frame bookmark" || className === "frame") {
      target = e.target;
    } else if (className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else if (className === "top") {
      target = e.target.parentElement.parentElement;
    } else {
      target = e.target.parentElement;
    }
    const newIndex = nodes.indexOf(target);
    const newChild = page.children[newIndex];
    const oldChild = page.children[oldIndex];
    // remove element if old Element = bookmark and new Element = carton
    if (newChild.className === "frame folderItem" && newChild.id !== oldChild.id) {
      const className = oldChild.className;
      let type;
      if (className === "frame folderItem") {
        type = "folder";
      } else if (className === "frame bookmark") {
        type = "bookmark";
      } else {
        type = "stickyNote";
      }
      if (type === "folder") {
        sidebarFolderChange(oldChild, newChild);
      }
      const timestamp = getTimeStamp();
      const subfolder = { type: type, update_id: oldChild.id, folder_id: newChild.id, time: timestamp };
      insertIntoSubFolder(subfolder);
      page.removeChild(oldChild);
    } else {
    // set new sequence
      const parentDiv = target.parentNode;
      if (newIndex < oldIndex) {
        let dragBeforeNum;
        let dragAfterNum;
        if (oldChild.className === "frame folderItem") {
          const folderItem = document.querySelectorAll(".folderItem");
          const nodeTest = Array.prototype.slice.call(folderItem);
          dragBeforeNum = nodeTest.indexOf(oldChild);
        }
        parentDiv.insertBefore(oldChild, newChild);
        if (oldChild.className === "frame folderItem") {
          const folderItem = document.querySelectorAll(".folderItem");
          const nodeTest = Array.prototype.slice.call(folderItem);
          dragAfterNum = nodeTest.indexOf(oldChild);
          if (dragBeforeNum !== dragAfterNum) {
            const oldSidebarItemId = "sidebar" + " " + oldChild.id;
            const oldSidebarItem = document.getElementById(oldSidebarItemId);
            const sidebarParent = oldSidebarItem.parentNode;
            if (sidebarParent.classList.contains("parentSideBar")) {
              const newSidebarItem = sidebarParent.children[parseInt(dragAfterNum) + parseInt(1)];
              sidebarParent.insertBefore(oldSidebarItem, newSidebarItem);
            } else {
              const newSidebarItem = sidebarParent.children[dragAfterNum];
              sidebarContent.insertBefore(oldSidebarItem, newSidebarItem);
            }
          }
        }
      } else {
        let dragBeforeNum;
        let dragAfterNum;
        if (oldChild.className === "frame folderItem") {
          const folderItem = document.querySelectorAll(".folderItem");
          const nodeTest = Array.prototype.slice.call(folderItem);
          dragBeforeNum = nodeTest.indexOf(oldChild);
        }
        // parentDiv.insertBefore(page.children[newIndex], page.children[oldIndex]);
        insertAfter(parentDiv, oldChild, newChild);
        if (oldChild.className === "frame folderItem") {
          const folderItem = document.querySelectorAll(".folderItem");
          const nodeTest = Array.prototype.slice.call(folderItem);
          dragAfterNum = nodeTest.indexOf(oldChild);
          if (dragBeforeNum !== dragAfterNum) {
            const oldSidebarItemId = "sidebar" + " " + oldChild.id;
            const oldSidebarItem = document.getElementById(oldSidebarItemId);
            const sidebarParent = oldSidebarItem.parentNode;
            if (sidebarParent.classList.contains("parentSideBar")) {
              const newSidebarItem = sidebarParent.children[parseInt(dragAfterNum) + parseInt(1)];
              insertAfter(sidebarParent, oldSidebarItem, newSidebarItem);
            } else {
              const newSidebarItem = sidebarParent.children[dragAfterNum];
              insertAfter(sidebarContent, oldSidebarItem, newSidebarItem);
            }
          }
        }
      }

      const nodes2 = Array.prototype.slice.call(page.children);
      const orderData = order(nodes2);
      sequenceUpdate(orderData);
    }
  }
});

page.addEventListener("dragenter", cancelDefault);
page.addEventListener("dragover", cancelDefault);

dataArea.addEventListener("dragstart", (e) => {
  const id = e.target.parentNode.id;
  const dataObj = { origin: "block", block_id: id, draggedId: e.target.id, draggedType: e.target.className };
  e.dataTransfer.setData("data", JSON.stringify(dataObj));
});

// drop into a block
dataArea.addEventListener("drop", (e) => {
  let target;
  let type;
  let divId;
  if (e.dataTransfer.getData("text/plain")) {
    const oldIndex = e.dataTransfer.getData("text/plain");
    const oldChild = page.children[oldIndex];
    const className = oldChild.className;
    if (e.target.className === "frame folderItem" || e.target.className === "frame bookmark" || e.target.className === "block" || e.target.className === "frame") {
      target = e.target;
    } else if (e.target.className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else if (e.target.className === "top") {
      target = e.target.parentElement.parentElement;
    } else {
      target = e.target.parentNode;
    }
    if (target.className === "block") {
      divId = target.id;
    } else {
      divId = target.parentNode.id;
    }
    if (target.className === "frame folderItem" && target.id !== oldChild.id) {
      if (className === "frame folderItem") {
        type = "folder";
      } else if (className === "frame bookmark") {
        type = "bookmark";
      } else {
        type = "stickyNote";
      }
      if (type === "folder") {
        const newChild = document.getElementById(target.id);
        sidebarFolderChange(oldChild, newChild);
      }
      const timestamp = getTimeStamp();
      const subfolder = { type: type, update_id: oldChild.id, folder_id: target.id, time: timestamp };
      insertIntoSubFolder(subfolder);
      page.removeChild(oldChild);
    } else if (target.className === "block" || target.parentNode.className === "block") {
      // get data from page
      if (target.className === "block") {
        target.appendChild(document.getElementById(oldChild.id));
      } else {
        const parentNode = document.getElementById(target.parentNode.id);
        parentNode.appendChild(document.getElementById(oldChild.id));
      }
      if (className === "frame folderItem") {
        type = "folder";
      } else if (className === "frame bookmark") {
        type = "bookmark";
      } else {
        type = "stickyNote";
      }
      const blockData = { type: type, update_id: oldChild.id, div_id: divId, time: getTimeStamp() };
      insertIntoSubFolder(blockData);
    }
    // }
  } else {
    const data = JSON.parse(e.dataTransfer.getData("data"));
    const className = e.target.className;
    if (className === "frame folderItem" || className === "frame bookmark" || className === "block" || className === "frame") {
      target = e.target;
    } else if (className === "title") {
      target = e.target.parentElement.parentElement.parentElement;
    } else if (className === "top") {
      target = e.target.parentElement.parentElement;
    } else {
      target = e.target.parentNode;
    }
    if (className === "frame folderItem" && target.id !== data.draggedId) {
      if (data.draggedType === "frame folderItem") {
        type = "folder";
      } else if (data.draggedType === "frame bookmark") {
        type = "bookmark";
      } else {
        type = "stickyNote";
      }
      if (type === "folder") {
        const oldChild = document.getElementById(data.draggedId);
        const newChild = document.getElementById(target.id);
        sidebarFolderChange(oldChild, newChild);
      }
      const timestamp = getTimeStamp();
      const subfolder = { type: type, update_id: data.draggedId, folder_id: target.id, time: timestamp };
      insertIntoSubFolder(subfolder);
      const oldParent = document.getElementById(data.block_id);
      oldParent.removeChild(document.getElementById(data.draggedId));
    } else if (target.className === "block") {
      // get data from page
      if (target.className === "block") {
        divId = target.id;
      } else {
        divId = target.parentNode.id;
      }
      if (target.className === "block") {
        target.appendChild(document.getElementById(data.draggedId));
      } else {
        const parentNode = document.getElementById(target.parentNode.id);
        parentNode.appendChild(document.getElementById(data.draggedId));
      }
      if (data.draggedType === "frame folderItem") {
        type = "folder";
      } else if (data.draggedType === "frame bookmark") {
        type = "bookmark";
      } else {
        type = "stickyNote";
      }
      const blockData = { type: type, update_id: data.draggedId, div_id: divId, time: getTimeStamp() };
      insertIntoSubFolder(blockData);
    } else {
      const blockParent = document.getElementById(target.parentNode.id);
      const nodes = Array.prototype.slice.call(blockParent.children);
      const newIndex = nodes.indexOf(target);
      const oldChild = document.getElementById(data.draggedId);
      const oldIndex = nodes.indexOf(oldChild);
      const parentDiv = target.parentNode;
      if (newIndex < oldIndex) {
        parentDiv.insertBefore(oldChild, target);
      } else {
      // parentDiv.insertBefore(page.children[newIndex], page.children[oldIndex]);
        insertAfter(parentDiv, oldChild, target);
      }

      const nodes2 = Array.prototype.slice.call(blockParent.children);
      const orderData = order(nodes2);
      sequenceUpdate(orderData);
    }
  }
});
dataArea.addEventListener("dragenter", cancelDefault);
dataArea.addEventListener("dragover", cancelDefault);

sidebarContent.addEventListener("drop", (e) => {
  if (e.target.id !== "sidebarContent") {
    if (e.target.className === "sidebar_button") {
      e.target.parentNode.classList.remove("dropdown_hover");
    } else {
      e.target.classList.remove("dropdown_hover");
    }
  }
  const data = e.dataTransfer.getData("text/plain");
  // get oldFolder
  const oldItem = page.children[data];
  const oldSidebarFolderId = "sidebar" + " " + oldItem.id;
  const oldSidebarFolder = document.getElementById(oldSidebarFolderId);
  let target;
  if (e.target.className === "sidebar_button") {
    target = e.target.parentNode;
  } else {
    target = e.target;
  }
  let type;
  if (oldItem.className === "frame bookmark") {
    type = "bookmark";
  } else {
    type = "folder";
  }
  const newParentId = target.id;
  const newParentIdArr = newParentId.split(" ");
  const updateData = { type: type, update_id: oldItem.id, folder_id: newParentIdArr[1], time: getTimeStamp() };
  dropSidebarFolder(updateData).then(data => {
    if (type === "folder") {
      const oldFolderParentNode = oldSidebarFolder.parentNode;
      const num = target.children.length;
      if (num === 0) {
        const nameString = target.className;
        const nameArr = nameString.split(" ");
        target.innerHTML = "";
        target.innerHTML = `<button class=sidebar_button><img src="images/down-before.svg" class="downBefore">${nameArr[1]}</button>`;
        target.className = "parentSideBar" + " " + nameArr[1];
        oldSidebarFolder.style.display = "none";
      } else {
        if (target.children[1].style.display === "none") {
          oldSidebarFolder.style.display = "none";
        } else {
          oldSidebarFolder.style.display = "block";
          oldSidebarFolder.style.marginLeft = "3em";
        }
      }
      // append child
      target.appendChild(oldSidebarFolder);
      if (oldFolderParentNode.id !== "sidebarContent") {
        if (oldFolderParentNode.classList.contains("parentSideBar")) {
          const sidebarLength = parseInt(oldFolderParentNode.children.length) - parseInt(1);
          if (sidebarLength === 0) {
            const nameString = oldFolderParentNode.className;
            const nameArr = nameString.split(" ");
            oldFolderParentNode.className = "bar_item" + " " + nameArr[1];
            oldFolderParentNode.innerHTML = nameArr[1];
          }
        }
      }

      page.removeChild(oldItem);
    } else {
      page.removeChild(oldItem);
    }
  });
});

sidebarContent.addEventListener("dragenter", cancelDefault);
sidebarContent.addEventListener("dragover", dragOver);
sidebarContent.addEventListener("dragleave", dragLeave);

function dragOver (e) {
  cancelDefault(e);
  if (e.target.id !== "sidebarContent") {
    if (e.target.className === "sidebar_button") {
      e.target.parentNode.classList.add("dropdown_hover");
    } else {
      e.target.classList.add("dropdown_hover");
    }
  }
}

function dragLeave (e) {
  if (e.target.id !== "sidebarContent") {
    if (e.target.className === "sidebar_button") {
      e.target.parentNode.classList.remove("dropdown_hover");
    } else {
      e.target.classList.remove("dropdown_hover");
    }
  }
}

function cancelDefault (e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

function insertAfter (parent, oldElement, newElement) {
  if (parent.lastChild === newElement) { // 如果最後的節點是目標元素，則直接新增。因為預設是最後
    parent.appendChild(oldElement);
  } else {
    parent.insertBefore(oldElement, newElement.nextSibling);// 如果不是，則插入在目標元素的下一個兄弟節點的前面。也就是目標元素的後面。
  }
}

function sidebarFolderChange (oldEle, newEle) {
  const oldFolderId = "sidebar" + " " + oldEle.id;
  const oldFolderItem = document.getElementById(oldFolderId);
  const newFolderId = "sidebar" + " " + newEle.id;
  const newFolderItem = document.getElementById(newFolderId);
  const num = newFolderItem.children.length;
  if (num === 0) {
    const nameString = newFolderItem.className;
    const nameArr = nameString.split(" ");
    newFolderItem.innerHTML = "";
    newFolderItem.innerHTML = `<button class=sidebar_button><img src="images/down-before.svg" class="downBefore">${nameArr[1]}</button>`;
    newFolderItem.className = "parentSideBar" + " " + nameArr[1];
    oldFolderItem.style.display = "none";
  } else {
    if (newFolderItem.children[1].style.display === "none") {
      oldFolderItem.style.display = "none";
    } else {
      oldFolderItem.style.display = "block";
      oldFolderItem.style.marginLeft = "3em";
    }
  }
  // append child
  newFolderItem.appendChild(oldFolderItem);
}
