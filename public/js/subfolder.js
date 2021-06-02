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

// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

// // eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const block = document.getElementById("blockIcon");
const note = document.getElementById("noteIcon");
function folderClick (e) {
  console.log(e);
  const id = e.id;
  console.log(id);
  // eslint-disable-next-line no-undef
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
  const parentId = document.createElement("div");
  const container = document.getElementById("container");
  parentId.setAttribute("id", "parent_id");
  parentId.style.display = "none";
  parentId.innerHTML = e.id;
  container.appendChild(parentId);
  block.style.display = "block";
  note.style.display = "block";
}

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

block.addEventListener("click", () => {
  dataArea.style.display = "block";
  const parent = document.getElementById("parent_id");
  const id = parent.innerHTML;
  console.log(id);
  getBlockData(id).then(data => {
    for (const n of data.data) {
      const div = document.createElement("div");
      div.setAttribute("class", "block");
      div.setAttribute("draggable", "true");
      for (const x of n.bookmarks) {
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
      }
      dataArea.appendChild(div);
    }
  });
});
