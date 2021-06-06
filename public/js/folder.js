const page = document.getElementById("page");
const plus = document.getElementById("plus");

const createItem = async (data) => {
  const response = await fetch("/api/1.0/item", {
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

let num;
// eslint-disable-next-line no-undef
plus.addEventListener("click", (e) => {
  const id = e.target.id;
  console.log(id);
  const parentId = document.getElementById("parent_id");
  if (parentId) {
    num = parentId.innerHTML;
  }
  console.log(num);
  // eslint-disable-next-line no-undef
  const timestamp = getTimeStamp();
  console.log(timestamp);
  const inputId = parseInt(timestamp) + parseInt(1);
  const addCarton = document.createElement("div");
  const dataId = getRandomNumber();
  addCarton.setAttribute("class", "frame folderItem");
  // eslint-disable-next-line no-undef
  addCarton.setAttribute("id", dataId);
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
  const folder = document.getElementById(inputId);
  let data;
  if (num) {
    // eslint-disable-next-line no-undef
    data = { type: "folder", id: dataId, name: folder.value, folder_id: num, time: timestamp };
  } else {
    // eslint-disable-next-line no-undef
    data = { type: "folder", id: dataId, name: folder.value, folder_id: 0, time: timestamp };
  }
  console.log(data);
  createItem(data).then(data => {
    console.log("insert db folder");
    const response = data;
    console.log(response);
  });
});
