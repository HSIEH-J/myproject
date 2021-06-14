/* eslint-disable no-undef */
const token = localStorage.getItem("accessToken");
// console.log(token);

if (!token) {
  alert("請先登入");
  window.location.href = "/sign.html";
}

// render main content data
const getBookmarkData = async () => {
  const response = await fetch("/api/1.0/get", {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  const data = await response.json();
  return data;
};

waitingImg.style.display = "block";
getBookmarkData().then(data => {
  waitingImg.style.display = "none";
  const get = data.data;
  console.log(get);
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
      page.appendChild(addCarton);
    }
  }
});

const homepage = document.getElementById("homepage");
homepage.addEventListener("click", (e) => {
  location.reload();
});

const changeFolderName = async (data) => {
  const response = await fetch("/api/1.0/name", {
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

function changeName (id) {
  const inputItem = document.getElementById(id);
  const name = inputItem.value;
  // alert(name);
  const parentId = inputItem.parentNode.parentNode.id;
  console.log(parentId);
  const sidebarId = "sidebar" + " " + parentId;
  const sidebarItem = document.getElementById(sidebarId);
  console.log(sidebarItem);
  if (sidebarItem.children.length === 0) {
    sidebarItem.className = "bar_item" + " " + name;
    sidebarItem.innerHTML = name;
  } else {
    sidebarItem.className = "parentSideBar" + " " + name;
    if (sidebarItem.children[1].style.display === "block") {
      sidebarItem.children[0].innerHTML = `<img src="images/down.svg" class="down">${name}`;
    } else {
      sidebarItem.children[0].innerHTML = `<img src="images/down-before.svg" class="downBefore">${name}`;
    }
  }
  const data = { id: parentId, name: name };
  console.log(data);
  changeFolderName(data).then(data => {
    console.log(data);
  });
}
