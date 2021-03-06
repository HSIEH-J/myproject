const searchSelect = document.getElementById("searchSelect");
const search = document.getElementById("search");
const waitingImg = document.getElementById("waitingImg");
/* eslint-disable no-undef */
const getSearchData = async (param, keyword) => {
  const response = await fetch(`/api/1.0/search/${param}?keyword=${keyword}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      // eslint-disable-next-line no-undef
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  if (response.status !== 200) {
    alert("There's something wrong...");
    waitingImg.style.display = "none";
    throw new Error("error");
  }
  const data = await response.json();
  return data;
};

// eslint-disable-next-line no-unused-vars
function searchItem () {
  const param = searchSelect.value;
  const keyword = search.value;
  const prevFolder = document.getElementById("parent_id");
  if (prevFolder) {
    const prevId = prevFolder.innerHTML;
    const prevSidebarId = "sidebar" + " " + prevId;
    const prevSidebarItem = document.getElementById(prevSidebarId);
    prevSidebarItem.classList.remove("dropdown_hover");
  }
  // eslint-disable-next-line no-undef
  parentData.innerHTML = "";
  // eslint-disable-next-line no-undef
  page.innerHTML = "";
  folderNameChange.innerHTML = param;
  waitingImg.style.display = "block";
  board.style.display = "none";
  note.style.display = "none";
  plusIcon.style.display = "none";
  plus.style.display = "none";
  importUrl.style.display = "none";
  getSearchData(param, keyword).then(data => {
    waitingImg.style.display = "none";
    search.value = "";
    const receiveData = data.data;
    if (receiveData.length === 0) {
      page.innerHTML = "<div id=\"result\">no results!</div>";
    } else {
      for (const n of receiveData) {
        if (n.type === "bookmark") {
          let parentRoute;
          if (n.parent) {
            parentRoute = n.parent;
          } else {
            parentRoute = "homepage";
          }
          const overTitle = overString(n.title);
          const newTitle = overTitle.join("");
          const frame = document.createElement("div");
          frame.setAttribute("class", "frame bookmark");
          frame.setAttribute("draggable", "true");
          frame.setAttribute("id", `${n.id}`);
          frame.innerHTML = `<a href=${n.url} class="thumbnailUrl" target="_blank">
                              <div class="top">
                                  <div class="thumbnail">
                                    <img src=${n.thumbnail} width=250>
                                  </div>
                              </div>
                              <div class="info">
                                  <div class='title'>${newTitle}</div>
                              </div>
                             </a>
                             <div class="trashCan bookmarkTrash">
                                <img src="images/trash.svg" width="35px" height="35px">
                             </div>
                             <div class="textReminder">
                                ${parentRoute}
                             </div>`;
          frame.title = n.title;
          // eslint-disable-next-line no-undef
          page.appendChild(frame);
        } else if (n.type === "folder") {
          let parentRoute;
          if (n.parent) {
            parentRoute = n.parent;
          } else {
            parentRoute = "homepage";
          }
          const addCarton = document.createElement("div");
          addCarton.setAttribute("class", "frame folderItem");
          // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
          addCarton.setAttribute("draggable", "true");
          // addCarton.setAttribute("onclick", "folderClick(this)");
          addCarton.setAttribute("id", `${n.id}`);
          const inputId = parseInt(getTimeStamp()) + parseInt(n);
          addCarton.innerHTML = `<div>
                                    <img src="images/folder-2.png" class="newFolder">
                                 </div>
                                 <div>
                                    <input type="text" class="folderName" value="${n.folder_name}" id="${inputId}" onchange="changeName(this.id)">
                                 </div>
                                 <div class="trashCan folderTrash">
                                    <img src="images/trash.svg" width="35px" height="35px">
                                 </div>
                                 <div class="textReminder">
                                    ${parentRoute}
                                 </div>`;
          // eslint-disable-next-line no-undef
          page.appendChild(addCarton);
        } else {
          let parentRoute;
          if (n.parent) {
            parentRoute = n.parent;
          } else {
            parentRoute = "homepage";
          }
          const noteDiv = document.createElement("div");
          noteDiv.className = "frame";
          noteDiv.setAttribute("draggable", "true");
          noteDiv.setAttribute("id", n.id);
          const textAreaId = parseInt(getTimeStamp()) + parseInt(n);
          let text;
          if (n.text === null) {
            text = "";
          } else {
            text = n.text;
          }
          noteDiv.innerHTML += `<textarea class="stickyNote" id=${textAreaId} type="text" maxlength ="150" oninput="input(this)">${text}</textarea>`;
          noteDiv.innerHTML += `<div class="trashCan noteTrash">
                                    <img src="images/trash.svg" width="35px" height="35px">
                                </div>
                                <div class="textReminder">
                                        ${parentRoute}
                                </div>`;
          page.appendChild(noteDiv);
        }
      }
    }
  });
}
