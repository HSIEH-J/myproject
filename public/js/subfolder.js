/* eslint-disable no-undef */
// // const url = location.href;
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
  }
  if (e.target.className === "folderName") {
    console.log("name");
    const parent = e.target.parentNode.parentNode;
    console.log(parent);
    console.log(parent.draggable);
    parent.draggable = false;
    console.log(parent.draggable);
    console.log(parent);
  }
});

function folderClick (e) {
  console.log(e);
  const id = e.id;
  console.log(id);
  const folderNameItem = document.getElementById(id);
  const folderName = folderNameItem.children[1].children[0].value;
  folderNameChange.innerHTML = folderName;
  console.log(folderNameChange);
  // eslint-disable-next-line no-undef
  console.log(dataArea.style.display);
  if (e.parentNode.className === "block" || dataArea.style.display === "block") {
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
                           </a>`;
        // eslint-disable-next-line no-undef
        page.appendChild(frame);
      } else {
        const addCarton = document.createElement("div");
        addCarton.setAttribute("class", "frame folderItem");
        // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
        addCarton.setAttribute("draggable", "true");
        addCarton.setAttribute("onclick", "folderClick(this)");
        addCarton.setAttribute("id", `${get[n].id}`);
        addCarton.innerHTML = `<div>
                                <img src="images/folder-2.png" class="newFolder">
                               </div>
                               <div>
                                <input type="text" class="folderName" value="${get[n].folder_name}" id="folder${n}">
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
                               </a>`;
            div.appendChild(frame);
          } else {
            const addCarton = document.createElement("div");
            addCarton.setAttribute("class", "frame folderItem");
            // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
            addCarton.setAttribute("draggable", "true");
            addCarton.setAttribute("onclick", "folderClick(this)");
            addCarton.setAttribute("id", `${x.id}`);
            addCarton.innerHTML = `<div>
                                    <img src="images/folder-2.png" class="newFolder">
                                   </div>
                                   <div>
                                    <input type="text" class="folderName" value="${x.folder_name}">
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
  parentId.innerHTML = e.id;
  page.appendChild(parentId);
  board.style.display = "block";
  note.style.display = "block";
}

const highlight = document.getElementById("highlight");
const block = document.getElementsByClassName("block");
board.addEventListener("click", () => {
  container.style.width = "20vw";
  dataArea.style.width = "70vw";
  dataArea.style.display = "block";
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

// eslint-disable-next-line no-unused-vars
function createBoard () {
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
  BlockDiv.id = divId;
  dataArea.appendChild(BlockDiv);
  const data = { div_id: divId, folder_id: num, time: time };
  createBlock(data).then(data => {
    console.log(data);
  });
}

noteIcon.addEventListener("click", (e) => {
  const parentId = document.getElementById("parent_id");
  if (parentId) {
    num = parentId.innerHTML;
  }
  console.log(num);
  const BlockDiv = document.createElement("div");
  const time = getTimeStamp();
  const divId = getRandomNumber();
  BlockDiv.setAttribute("class", "block");
  BlockDiv.setAttribute("draggable", "true");
  BlockDiv.id = divId;
  dataArea.appendChild(BlockDiv);
  const data = { div_id: divId, folder_id: num, time: time };
  createBlock(data).then(data => {
    console.log(data);
  });
});
