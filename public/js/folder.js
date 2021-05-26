const page = document.getElementById("page");
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

let num;
option.addEventListener("click", (e) => {
  const parentId = document.getElementById("parent_id");
  if (parentId !== null) {
    num = parentId.textContent;
  }
  const point = e.target.id;
  // eslint-disable-next-line no-undef
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

  option.style.display = "none";
  // location.reload();
});
