function getTimeStamp () {
  const date = Date.now() + performance.now();
  const timestamp = Math.floor(date / 1000); ;
  return timestamp;
}

function getRandomNumber () {
  let d = Date.now();
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    d += performance.now(); // use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const createBookmark = async (data) => {
  const response = await fetch("/api/1.0/test", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "POST"
  });
  if (response.status === 500) {
    alert("there's something wrong... Please try later");
    throw Error("there's something wrong");
  }
  if (response.status !== 200) {
    alert("please check your url again");
    throw Error("please check your url again");
  }
  const json = await response.json();
  return json;
};

const box = document.getElementById("box");
const importUrl = document.getElementById("import");
const urlClick = document.getElementById("url");

// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

importUrl.addEventListener("click", () => {
  urlClick.style.display = "block";
});

box.addEventListener("keydown", (e) => {
  const parentId = document.getElementById("parent_id");
  let parent;
  if (parentId) {
    parent = parentId.innerHTML;
  }
  console.log(parent);
  let urlData;
  if (e.code === "Enter") {
    urlClick.style.display = "none";
    const url = box.value;
    if (!url) {
      alert("You didn't enter any urls");
      urlClick.style.display = "none";
    } else {
      if (parent) {
        urlData = { parent_id: parent, url: url };
      } else {
        urlData = { url: url };
      }
      box.value = "";
      createBookmark(urlData).then(data => {
        console.log(data);
        if (data.id) {
          console.log("append first");
          const frame = document.createElement("div");
          frame.setAttribute("class", "frame bookmark");
          frame.setAttribute("draggable", "true");
          frame.id = data.id;
          frame.innerHTML = `<a href=${url} class="thumbnailUrl" target="_blank">
                              <div class="top">
                                  <div class="thumbnail">
                                      <img src="./images/default.svg" width=250 class="default">
                                  </div>
                              </div>
                              <div class="info">
                                  <div class='title'>${"Loading..."}</div>
                              </div>
                              </a>
                              <div class="trashCan bookmarkTrash">
                                  <img src="images/trash.svg" width="35px" height="35px">
                              </div>`;
          page.appendChild(frame);
        } else {
          console.log("done");
          const receiveData = data.data[0];
          const overTitle = overString(receiveData.title);
          const newTitle = overTitle.join("");
          const frame = document.createElement("div");
          frame.setAttribute("class", "frame bookmark");
          frame.setAttribute("draggable", "true");
          frame.id = receiveData.id;
          frame.innerHTML = `<a href=${url} class="thumbnailUrl" target="_blank">
                              <div class="top">
                                  <div class="thumbnail">
                                      <img src="${receiveData.thumbnail}">
                                  </div>
                              </div>
                              <div class="info">
                                  <div class='title'>${newTitle}</div>
                              </div>
                              </a>
                              <div class="trashCan bookmarkTrash">
                                  <img src="images/trash.svg" width="35px" height="35px">
                              </div>`;
          page.appendChild(frame);
        }
      });
    }
  }
});

// document.addEventListener("mouseover", (e) => {
//   console.log(e.target);
// });
