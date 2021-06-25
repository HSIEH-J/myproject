const page = document.getElementById("page");
const plus = document.getElementById("plus");

const createItem = async (data) => {
  const response = await fetch("/api/1.0/item", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      // eslint-disable-next-line no-undef
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

// eslint-disable-next-line no-undef
plus.addEventListener("click", (e) => {
  const id = e.target.id;
  console.log(id);
  const parentId = document.getElementById("parent_id");
  console.log(parentId);
  let num;
  if (parentId) {
    num = parentId.innerHTML;
  }
  console.log(num);
  let data;
  if (num) {
    // eslint-disable-next-line no-undef
    data = { type: "folder", folder_id: num };
  } else {
    // eslint-disable-next-line no-undef
    data = { type: "folder", folder_id: 0 };
  }
  console.log(data);
  createItem(data).then(data => {
    console.log(data);
    if (num) {
      const parentSidebarId = "sidebar" + " " + num;
      console.log(parentSidebarId);
      const parentSideBar = document.getElementById(parentSidebarId);
      const div = document.createElement("div");
      div.innerHTML = "folder";
      div.id = "sidebar" + " " + data.id;
      div.className = "bar_item" + " " + "folder";
      if (parentSideBar.children.length === 0) {
        parentSideBar.innerHTML = "";
        parentSideBar.innerHTML = `<button class=sidebar_button><img src="images/down-before.svg" class="downBefore">${parentId.className}</button>`;
        parentSideBar.className = "parentSideBar" + " " + parentId.className;
        console.log(parentSideBar);
        div.style.display = "none";
      } else {
        if (parentSideBar.children[1].style.display === "none") {
          div.style.display = "none";
        } else {
          div.style.display = "block";
          div.style.marginLeft = "1.5%";
        }
      }
      parentSideBar.append(div);
    } else {
      const div = document.createElement("div");
      div.innerHTML = "folder";
      div.id = "sidebar" + " " + data.id;
      div.className = "bar_item" + " " + "folder";
      // eslint-disable-next-line no-undef
      sidebarContent.appendChild(div);
    }
    // eslint-disable-next-line no-undef
    const timestamp = getTimeStamp();
    const inputId = parseInt(timestamp) + parseInt(1);
    const addCarton = document.createElement("div");
    addCarton.setAttribute("class", "frame folderItem");
    // eslint-disable-next-line no-undef
    addCarton.setAttribute("id", data.id);
    // addCarton.setAttribute("onclick", "folderClick(this)");
    addCarton.setAttribute("draggable", "true");
    addCarton.innerHTML = ` <div>
                              <img src="images/folder-2.png" class="newFolder">
                            </div>
                            <div>
                              <input type="text" class="folderName" value="folder" id=${inputId} onchange="changeName(this.id)">
                            </div>
                            <div class="trashCan folderTrash">
                              <img src="images/trash.svg" width="35px" height="35px">
                            </div>`;
    page.appendChild(addCarton);
  });
  ;
});
