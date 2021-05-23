const box = document.getElementById("box");
const page = document.getElementById("page");

const getBookmarkData = async () => {
  const response = await fetch("/api/1.0/get");
  const data = await response.json();
  return data;
};

getBookmarkData().then(data => {
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
                            <div class="pencil">
                              <img src="../images/pencil.png">
                            </div>
                            <div class="thumbnail">
                              <img src=${get[n].thumbnail} width=250>
                            </div>
                         </div>
                         <div class="info">
                            <div class='title'>${get[n].title}</div>
                         </div>
                         </a>`;
      page.appendChild(frame);
    } else {
      const addCarton = document.createElement("div");
      addCarton.setAttribute("class", "frame folderItem");
      // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
      addCarton.setAttribute("draggable", "true");
      addCarton.setAttribute("id", `${get[n].id}`);
      addCarton.innerHTML = ` <div>
                              <img src="images/folder-Design.png" class="newFolder">
                            </div>
                            <div>
                              <input type="text" class="folderName" value="${get[n].folder_name}" id="folder${n}">
                            </div>`;
      page.appendChild(addCarton);
    }
  }
});

function getTimeStamp () {
  const date = Date.now(); ;
  const timestamp = Math.floor(date / 1000); ;
  return timestamp;
}

// eslint-disable-next-line no-unused-vars
function addBookmarkPage () {
  const url = box.value;
  const timestamp = getTimeStamp();
  const urlData = { url: url, time: timestamp };
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      box.value = "";
      console.log(xhr.responseText);
      const text = xhr.responseText;
      if (text === "true") {
        alert("書籤已插入...");
        location.reload();
      } else {
        alert("書籤製作中，請稍等...");
      }
    }
  };
  xhr.open("post", "/api/1.0/test", true);
  xhr.setRequestHeader("Content-type", "application/json");
  const data = JSON.stringify(urlData);
  console.log(data);
  xhr.send(data);
};

// add folder
const plus = document.getElementById("plus");
const option = document.getElementById("option");
// const index = document.getElementById("index");
plus.addEventListener("click", () => {
  option.style.display = "block";
});

const createNewFolder = async (data) => {
  const response = await fetch("/api/1.0/folder", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

option.addEventListener("click", (e) => {
  const point = e.target.id;
  const timestamp = getTimeStamp();
  console.log(timestamp);
  const inputId = parseInt(timestamp) + parseInt(1);
  // const num = getRandomNumber();
  if (point === "folder") {
    const addCarton = document.createElement("div");
    addCarton.setAttribute("class", "frame folderItem");
    addCarton.setAttribute("id", timestamp);
    addCarton.setAttribute("draggable", "true");
    addCarton.innerHTML = ` <div>
                              <img src="images/folder-Design.png" class="newFolder">
                            </div>
                            <div>
                              <input type="text" class="folderName" value="unnamed folder" id=${inputId}>
                            </div>`;
    page.appendChild(addCarton);
    const folder = document.getElementById(inputId);
    const data = { name: folder.value, time: timestamp };
    console.log(data);
    createNewFolder(data).then(data => {
      const response = data;
      console.log(response);
    });
  }

  option.style.display = "none";
});

// Sidebar
// eslint-disable-next-line camelcase
const bar_block = document.querySelector(".bar_block");
const hamburger = document.querySelector(".hamburger");
const mainHeader = document.querySelector("#mainHeader");
const screen = document.querySelector(".screen");
const container = document.querySelector(".container");
// eslint-disable-next-line no-unused-vars
function openSidebar () {
  mainHeader.style.justifyContent = "flex-end";
  hamburger.style.display = "none";
  screen.style.display = "flex";
  bar_block.style.display = "block";
  container.style.width = "90vw";
}

// eslint-disable-next-line no-unused-vars
function closeSidebar () {
  mainHeader.style.justifyContent = "space-between";
  container.style.width = "100vw";
  hamburger.style.display = "block";
  bar_block.style.display = "none";
}

// nested structure
// eslint-disable-next-line camelcase
const dropdown_hover = document.querySelector(".dropdown_hover");
// eslint-disable-next-line camelcase
const dropdown_content = document.querySelector(".dropdown_content");
// eslint-disable-next-line camelcase
const sidebar_button = document.querySelector(".sidebar_button");
dropdown_hover.addEventListener("mouseenter", (e) => {
  e.target.style.background = "Gainsboro";
  sidebar_button.style.color = "SlateGrey";
  dropdown_content.style.display = "block";
  dropdown_content.style.background = "WhiteSmoke";
  dropdown_content.style.color = "sliver";
});

dropdown_hover.addEventListener("mouseleave", (e) => {
  e.target.style.background = "transparent";
  sidebar_button.style.color = "WhiteSmoke";
  dropdown_content.style.display = "none";
});
