/* eslint-disable no-undef */
// // const url = location.href; d
// // const id = url.split("=")[1];
const getData = async (id) => {
  const response = await fetch(`/api/1.0/get?id=${id}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  return await response.json();
};

const getBlockData = async (id) => {
  const response = await fetch(`/api/1.0/div?id=${id}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  return await response.json();
};

const removeItem = async (data) => {
  const response = await fetch("/api/1.0/remove", {
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

const updateBlockSize = async (data) => {
  const response = await fetch("/api/1.0/size", {
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

const createBlock = async (data) => {
  const response = await fetch("/api/1.0/block", {
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
// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

// // eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const board = document.getElementById("boardIcon");
const note = document.getElementById("noteIcon");
const plusIcon = document.getElementById("plusIcon");
const dataArea = document.getElementById("dataArea");
const container = document.getElementById("container");
const folderNameChange = document.getElementById("folderNameChange");
const addBlock = document.getElementById("addBlock");
const highlight = document.getElementById("highlight");
const block = document.getElementsByClassName("block");
const parentData = document.getElementById("parentData");
// const layout = document.getElementById("display");
document.addEventListener("click", (e) => {
  let num;
  console.log(e.target);
  if (e.target.className === "frame folderItem" || e.target.className === "sidebar_button" || e.target.classList.contains("bar_item")) {
    waitingImg.style.display = "block";
    let id;
    let folderName;
    const prevFolder = document.getElementById("parent_id");
    if (prevFolder) {
      console.log(prevFolder);
      const prevId = prevFolder.innerHTML;
      const prevSidebarId = "sidebar" + " " + prevId;
      const prevSidebarItem = document.getElementById(prevSidebarId);
      prevSidebarItem.style.background = "";
    }
    if (e.target.className === "frame folderItem") {
      id = e.target.id;
      // get folderName
      const folderNameItem = document.getElementById(id);
      folderName = folderNameItem.children[1].children[0].value;
      const sidebarFolderId = "sidebar" + " " + id;
      const sidebarItem = document.getElementById(sidebarFolderId);
      // current location
      sidebarItem.style.background = "CadetBlue";
    } else if (e.target.className === "sidebar_button") {
      // get folderName
      const parent = e.target.parentNode;
      const parentId = parent.id;
      const parentArr = parentId.split(" ");
      id = parentArr[1];
      const name = parent.className.split(" ");
      folderName = name[1];
      // current location
      parent.style.background = "CadetBlue";
    } else {
      // get folderName
      const sidebarItemId = e.target.id;
      const sidebarItemArr = sidebarItemId.split(" ");
      id = sidebarItemArr[1];
      const name = e.target.className.split(" ");
      folderName = name[1];
      // current location
      e.target.style.background = "CadetBlue";
    }
    if (!folderName) {
      folderNameChange.innerHTML = "folder";
    } else {
      folderNameChange.innerHTML = folderName;
    }
    console.log(folderNameChange);
    console.log(id);
    // layout.style.display = "flex";
    // layout.style.justifyContent = "space-around";
    // layout.style.width = "200px";
    console.log(e.target.id);
    urlClick.style.display = "none";
    // eslint-disable-next-line no-undef
    console.log(dataArea.style.display);
    if (e.target.className === "block" || dataArea.style.display === "block") {
      dataArea.style.display = "none";
      // dataArea.innerHTML = "";
      const div = document.querySelectorAll(".block");
      console.log(div.length);
      for (let i = 0; i < div.length; i++) {
        const child = document.getElementById(div[i].id);
        dataArea.removeChild(child);
      }
      container.style.width = "90vw";
    }
    page.innerHTML = "";
    parentData.innerHTML = "";
    getData(id).then(data => {
      waitingImg.style.display = "none";
      console.log(data);
      const get = data.data;
      for (const n in get) {
        if (get[n].url) {
          console.log("===undefined===");
          const overTitle = overString(get[n].title);
          const newTitle = overTitle.join("");
          const frame = document.createElement("div");
          frame.setAttribute("class", "frame bookmark");
          frame.setAttribute("draggable", "true");
          frame.setAttribute("id", `${get[n].id}`);
          frame.innerHTML = `<a href=${get[n].url} class="thumbnailUrl" target="_blank">
                            <div class="top">
                                <div class="thumbnail">
                                  <img src=${get[n].thumbnail} width=250>
                                </div>
                            </div>
                            <div class="info">
                                <div class='title'>${newTitle}</div>
                            </div>
                           </a>
                           <div class="trashCan bookmarkTrash">
                              <img src="images/trash.svg" width="35px" height="35px">
                           </div>`;
          frame.title = get[n].title;
          // eslint-disable-next-line no-undef
          page.appendChild(frame);
        } else if (get[n].folder_name) {
          const addCarton = document.createElement("div");
          addCarton.setAttribute("class", "frame folderItem");
          // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
          addCarton.setAttribute("draggable", "true");
          // addCarton.setAttribute("onclick", "folderClick(this)");
          addCarton.setAttribute("id", `${get[n].id}`);
          addCarton.innerHTML = `<div>
                                    <img src="images/folder-2.png" class="newFolder">
                                 </div>
                                 <div>
                                    <input type="text" class="folderName" value="${get[n].folder_name}" id="folder${n}" onchange="changeName(this.id)">
                                 </div>
                                 <div class="trashCan folderTrash">
                                    <img src="images/trash.svg" width="35px" height="35px">
                                 </div>`;
          // eslint-disable-next-line no-undef
          page.appendChild(addCarton);
        } else {
          const noteDiv = document.createElement("div");
          noteDiv.className = "frame";
          noteDiv.setAttribute("draggable", "true");
          noteDiv.setAttribute("id", get[n].id);
          const textAreaId = parseInt(getTimeStamp()) + parseInt(n);
          let text;
          console.log(get[n].text);
          if (get[n].text === null) {
            text = "";
          } else {
            text = get[n].text;
          }
          noteDiv.innerHTML += `<textarea class="stickyNote" id=${textAreaId} type="text" maxlength ="150" oninput="input(this)">${text}</textarea>`;
          noteDiv.innerHTML += `<div class="trashCan noteTrash">
                                  <img src="images/trash.svg" width="35px" height="35px">
                                </div>`;
          page.appendChild(noteDiv);
          if (get[n].width !== "null" && get[n].height !== "null") {
            const noteSize = document.getElementById(textAreaId);
            noteSize.style.width = get[n].width + "px";
            noteSize.style.heigh = get[n].height + "px";
          }
        }
      }
    });
    // render dataArea
    getBlockData(id).then(data => {
    // console.log(block.length);
      console.log(data.data);
      if (data.data.length === 0 && block.length === 0) {
        console.log("highlight block");
        highlight.style.display = "block";
      } else {
        for (const n of data.data) {
          const div = document.createElement("div");
          div.setAttribute("class", "block");
          div.setAttribute("id", n.div_id);
          div.setAttribute("draggable", "true");
          div.innerHTML = `<div class="trashCan blockTrash">
                              <img src="images/trash.svg" width="35px" height="35px" class="trashCan blockTrash">
                           </div>`;
          div.style.width = n.width + "px";
          div.style.height = n.height + "px";
          for (const x of n.details) {
            if (x.url) {
              const overTitle = overString(x.title);
              const newTitle = overTitle.join("");
              const frame = document.createElement("div");
              frame.setAttribute("class", "frame bookmark");
              frame.setAttribute("draggable", "true");
              frame.setAttribute("id", `${x.id}`);
              frame.innerHTML = `<a href=${x.url} class="thumbnailUrl" target="_blank">
                                  <div class="top">
                                      <div class="thumbnail">
                                        <img src=${x.thumbnail} width=250>
                                      </div>
                                  </div>
                                  <div class="info">
                                      <div class='title'>${newTitle}</div>
                                  </div>
                               </a>
                               <div class="trashCan bookmarkTrash">
                                  <img src="images/trash.svg" width="35px" height="35px">
                               </div>`;
              frame.title = x.title;
              div.appendChild(frame);
            } else if (x.folder_name) {
              const addCarton = document.createElement("div");
              addCarton.setAttribute("class", "frame folderItem");
              // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
              addCarton.setAttribute("draggable", "true");
              // addCarton.setAttribute("onclick", "folderClick(this)");
              addCarton.setAttribute("id", `${x.id}`);
              addCarton.innerHTML = `<div>
                                       <img src="images/folder-2.png" class="newFolder">
                                     </div>
                                     <div>
                                       <input type="text" class="folderName" value="${x.folder_name}" id="folder${parseInt(x) + parseInt(1)}" onchange="changeName(this.id)">
                                     </div>
                                     <div class="trashCan folderTrash">
                                       <img src="images/trash.svg" width="35px" height="35px">
                                     </div>`;
              div.appendChild(addCarton);
            } else {
              console.log("123");
              const noteDiv = document.createElement("div");
              noteDiv.className = "frame";
              noteDiv.setAttribute("draggable", "true");
              noteDiv.setAttribute("id", x.id);
              const textAreaId = parseInt(getTimeStamp()) + parseInt(n);
              let text;
              if (x.text === null) {
                text = "";
              } else {
                text = x.text;
              }
              noteDiv.innerHTML += `<textarea class="stickyNote" id=${textAreaId} type="text" maxlength ="150" oninput="input(this)">${text}</textarea>`;
              noteDiv.innerHTML += `<div class="trashCan noteTrash">
                                      <img src="images/trash.svg" width="35px" height="35px">
                                    </div>`;
              div.appendChild(noteDiv);
              // if (x.width !== "null" && x.height !== "null") {
              //   const noteSize = document.getElementById(textAreaId);
              //   noteSize.style.width = x.width + "px";
              //   noteSize.style.heigh = x.height + "px";
              // }
            }
          }
          dataArea.appendChild(div);
        }
      }
    });
    const parentId = document.createElement("div");
    parentId.setAttribute("id", "parent_id");
    parentId.style.display = "none";
    parentId.innerHTML = id;
    parentId.className = folderName;
    parentData.appendChild(parentId);
    board.style.display = "block";
    note.style.display = "block";
    plusIcon.style.display = "block";
  }
  if (e.target.className === "block") {
    console.log(e.target.style.width);
    console.log(e.target.style.height);
    const width = e.target.style.width;
    const height = e.target.style.height;
    if (width || height) {
      console.log("block size change");
      const data = { id: e.target.id, width: width, height: height };
      updateBlockSize(data).then(data => {
        console.log(data);
      });
    }
  }
  if (e.target.parentNode.classList.contains("trashCan")) {
    console.log(e.target.parentNode.parentNode);
    console.log(e.target.parentNode.parentNode.parentNode);
    const removeParent = e.target.parentNode.parentNode.parentNode;
    const removeChild = e.target.parentNode.parentNode;
    console.log(removeParent);
    console.log(removeChild);
    const id = removeChild.id;
    const parent = document.getElementById(removeParent.id);
    const child = document.getElementById(id);
    // confirm("Are you want to delete this Item?");
    const ans = confirm("Are you sure you want to delete this Item?");
    if (ans) {
      if (removeChild.className === "frame folderItem") {
        const sidebarId = "sidebar" + " " + id;
        const sidebarItem = document.getElementById(sidebarId);
        if (sidebarItem.parentNode.classList.contains("parentSideBar")) {
          const sidebarParentId = sidebarItem.parentNode.id;
          const sidebarParent = sidebarItem.parentNode;
          sidebarParent.removeChild(sidebarItem);
          const sidebarLength = parseInt(sidebarParent.children.length) - parseInt(1);
          if (sidebarLength === 0) {
            const nameString = sidebarParent.className;
            const nameArr = nameString.split(" ");
            // sidebarParent.id = "sidebar" + " " + sidebarParentId;
            sidebarParent.className = "bar_item" + " " + nameArr[1];
            sidebarParent.innerHTML = nameArr[1];
          }
        } else {
          sidebarContent.removeChild(sidebarItem);
        }
      }
      if (removeChild.className === "block" || removeParent.className === "block") {
        parent.removeChild(child);
      } else {
        const child = document.getElementById(id);
        page.removeChild(child);
      }
      let sendData;
      if (e.target.parentNode.className === "trashCan bookmarkTrash") {
        console.log("target bookmark");
        sendData = { type: "bookmark", id: id };
      } else if (e.target.parentNode.className === "trashCan folderTrash") {
        console.log("target folder");
        sendData = { type: "folder", id: id };
      } else if (e.target.parentNode.className === "trashCan blockTrash") {
        console.log("target block");
        sendData = { type: "block", id: id };
      } else {
        console.log("target stickyNote");
        sendData = { type: "stickyNote", id: id };
      }
      console.log(sendData);
      removeItem(sendData).then(data => {
        console.log("removed");
        console.log(data);
      });
    }
  }
  if (e.target.id === "boardIcon") {
    container.style.width = "30vw";
    dataArea.style.width = "60vw";
    dataArea.style.display = "block";
    console.log(block);
    if (block.length !== 0) {
      highlight.style.display = "none";
      addBlock.style.display = "block";
    } else {
      highlight.style.display = "block";
      addBlock.style.display = "none";
    }
  }
  if (e.target.id === "close") {
    dataArea.style.display = "none";
    container.style.width = "90vw";
  }
  if (e.target.id === "click" || e.target.id === "addBlock") {
    if (e.target.id === "click") {
      addBlock.style.display = "block";
    }
    const parentId = document.getElementById("parent_id");
    if (parentId) {
      num = parentId.innerHTML;
    }
    console.log(num);
    highlight.style.display = "none";
    const BlockDiv = document.createElement("div");
    const time = getTimeStamp();
    const divId = getRandomNumber();
    BlockDiv.setAttribute("class", "block");
    BlockDiv.setAttribute("draggable", "true");
    BlockDiv.innerHTML = `<div class="trashCan blockTrash">
                            <img src="images/trash.svg" width="35px" height="35px">
                          </div>`;
    BlockDiv.id = divId;
    dataArea.appendChild(BlockDiv);
    const data = { div_id: divId, folder_id: num, time: time };
    createBlock(data).then(data => {
      console.log(data);
    });
  }
  if (e.target.className === "stickyNote") {
    // const stickyNote = document.getElementsByClassName("stickyNote");
    const startPosition = e.target.selectionStart;
    const endPosition = e.target.selectionEnd;
    console.log(startPosition, endPosition);
  }
});

note.addEventListener("click", (e) => {
  const parent = document.getElementById("parent_id");
  const parentId = parent.innerHTML;
  console.log(parentId);
  const data = { type: "stickyNote", folder_id: parentId };
  console.log(data);
  createItem(data).then(data => {
    console.log(data);
    const noteDiv = document.createElement("div");
    noteDiv.className = "frame";
    noteDiv.setAttribute("draggable", "true");
    noteDiv.setAttribute("id", data.id);
    noteDiv.innerHTML += "<textarea class=\"stickyNote\" type=\"text\" maxlength =\"150\" oninput=\"input(this)\"></textarea>";
    noteDiv.innerHTML += `<div class="trashCan noteTrash">
                          <img src="images/trash.svg" width="35px" height="35px">
                        </div>`;
    page.appendChild(noteDiv);
  });
});

// const sticky = document.querySelector("stickyNote");
// sticky.addEventListener("input", (e) => {
//   console.log(e.target);
// });
