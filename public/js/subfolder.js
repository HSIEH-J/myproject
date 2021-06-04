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
// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

// // eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const board = document.getElementById("boardIcon");
const note = document.getElementById("noteIcon");
const dataArea = document.getElementById("dataArea");
const container = document.getElementById("container");
const folderNameChange = document.getElementById("folderNameChange");
document.addEventListener("click", (e) => {
  console.log(e.target);
  if (e.target.className === "frame folderItem") {
    console.log(e.target.id);
    const id = e.target.id;
    const folderNameItem = document.getElementById(id);
    const folderName = folderNameItem.children[1].children[0].value;
    if (!folderName) {
      folderNameChange.innerHTML = "folder";
    } else {
      folderNameChange.innerHTML = folderName;
    }

    console.log(folderNameChange);
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
    getData(id).then(data => {
      console.log(data);
      const get = data.data;
      for (const n in get) {
        if (get[n].folder_name === undefined) {
          console.log("===undefined===");
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
                                <div class='title'>${get[n].title}</div>
                            </div>
                           </a>
                           <div class="trashCan bookmarkTrash">
                              <img src="images/trash.svg" width="35px" height="35px">
                           </div>`;
          // eslint-disable-next-line no-undef
          page.appendChild(frame);
        } else {
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
            if (!x.folder_name) {
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
                                      <div class='title'>${x.title}</div>
                                  </div>
                               </a>
                               <div class="trashCan bookmarkTrash">
                                  <img src="images/trash.svg" width="35px" height="35px">
                               </div>`;
              div.appendChild(frame);
            } else {
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
    page.appendChild(parentId);
    board.style.display = "block";
    note.style.display = "block";
  }
  if (e.target.className === "block") {
    console.log(e.target.style.width);
    console.log(e.target.style.height);
    const data = { id: e.target.id, width: e.target.style.width, height: e.target.style.height };
    updateBlockSize(data).then(data => {
      console.log(data);
    });
  }
  if (e.target.parentNode.classList.contains("trashCan")) {
    console.log(e.target.parentNode.parentNode);
    console.log(e.target.parentNode.parentNode.parentNode);
    const removeParent = e.target.parentNode.parentNode.parentNode;
    const id = e.target.parentNode.parentNode.id;
    if (removeParent.className === "block") {
      const parent = document.getElementById(removeParent.id);
      const child = document.getElementById(id);
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
    }
    console.log(sendData);
    removeItem(sendData).then(data => {
      console.log("removed");
      console.log(data);
    });
  }
});

const highlight = document.getElementById("highlight");
const block = document.getElementsByClassName("block");
board.addEventListener("click", () => {
  container.style.width = "20vw";
  dataArea.style.width = "70vw";
  dataArea.style.display = "block";
  addBlock.style.display = "block";
  console.log(block);
});

const close = document.getElementById("close");

close.addEventListener("click", () => {
  dataArea.style.display = "none";
  container.style.width = "90vw";
});

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

const addBlock = document.getElementById("addBlock");
// eslint-disable-next-line no-unused-vars
function createBoard () {
  addBlock.style.display = "block";
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

addBlock.addEventListener("click", (e) => {
  const parentId = document.getElementById("parent_id");
  if (parentId) {
    num = parentId.innerHTML;
  }
  console.log(num);
  const BlockDiv = document.createElement("div");
  const time = getTimeStamp();
  const divId = getRandomNumber();
  BlockDiv.innerHTML = `<div class="trashCan blockTrash">
                          <img src="images/trash.svg" width="35px" height="35px">
                        </div>`;
  BlockDiv.setAttribute("class", "block");
  BlockDiv.setAttribute("draggable", "true");
  BlockDiv.id = divId;
  dataArea.appendChild(BlockDiv);
  const data = { div_id: divId, folder_id: num, time: time };
  createBlock(data).then(data => {
    console.log(data);
  });
});

note.addEventListener("click", (e) => {
  const noteDiv = document.createElement("div");
  noteDiv.className = "frame";
  noteDiv.setAttribute("maxlength", "150");
  noteDiv.setAttribute("draggable", "true");
  const time = getTimeStamp();
  noteDiv.id = time;
  // onchange=\"changeName(this.id)\"></textarea
  noteDiv.innerHTML += "<textarea class=\"stickyNote\" type=\"text\">";
  noteDiv.innerHTML += `<div class="trashCan noteTrash">
                          <img src="images/trash.svg" width="35px" height="35px">
                        </div>`;
  page.appendChild(noteDiv);
});

document.addEventListener("mousedown", (e) => {
  console.log(e.target);
});
