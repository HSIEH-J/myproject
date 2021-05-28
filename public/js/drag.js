/* eslint-disable no-undef */
page.addEventListener("dragstart", (e) => {
//   console.log(page.getElementsByTagName("div")[0]);
  console.log("dragStart");
  const nodes = Array.prototype.slice.call(page.children);
  console.log(nodes.indexOf(e.target));
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

page.addEventListener("drop", (e) => {
  console.log("dropped");
  cancelDefault(e);
  console.log(e.target.className);
  // get new and old index
  const nodes = Array.prototype.slice.call(page.children);
  console.log(nodes);
  const oldIndex = e.dataTransfer.getData("text/plain", index);
  let target;
  const className = e.target.className;
  if (className === "frame folderItem" || className === "block") {
    target = e.target;
  } else {
    target = e.target.parentElement.parentElement;
  }
  const newIndex = nodes.indexOf(target);
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
  } else if (target.className === "block") {
    target.appendChild(document.getElementById(oldChild.id));
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
});

page.addEventListener("dragenter", cancelDefault);
page.addEventListener("dragover", cancelDefault);

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
