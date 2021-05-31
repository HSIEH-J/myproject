const page = document.getElementById("page");

const createNewFolder = async (data) => {
  const response = await fetch("/api/1.0/folder", {
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
create.addEventListener("click", (e) => {
  const id = e.target.id;
  const parentId = document.getElementById("parent_id");
  num = parentId.textContent;
  if (id === "plus") {
    const timestamp = getTimeStamp();
    console.log(timestamp);
    const inputId = parseInt(timestamp) + parseInt(1);
    const addCarton = document.createElement("div");
    addCarton.setAttribute("class", "frame folderItem");
    addCarton.setAttribute("id", timestamp);
    addCarton.setAttribute("draggable", "true");
    addCarton.innerHTML = ` <div>
                                <img src="images/folder-2.png" class="newFolder">
                              </div>
                              <div>
                                <input type="text" class="folderName" value="folder" id=${inputId}>
                              </div>`;
    page.appendChild(addCarton);
    const folder = document.getElementById(inputId);
    let data;
    if (num) {
      data = { name: folder.value, folder_id: num, time: timestamp };
    } else {
      data = { name: folder.value, folder_id: 0, time: timestamp };
    }
    console.log(data);
    createNewFolder(data).then(data => {
      const response = data;
      console.log(response);
    });
  }
});
