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

const box = document.getElementById("box");
const importUrl = document.getElementById("import");
const urlClick = document.getElementById("url");

// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

importUrl.addEventListener("click", () => {
  urlClick.style.display = "block";
  box.value = "";
});

box.addEventListener("click", (e) => {
  box.value = "";
});

box.addEventListener("keydown", (e) => {
  const parentId = document.getElementById("parent_id");
  let parent;
  if (parentId) {
    parent = parentId.innerHTML;
  }
  console.log(parent);
  let urlData;
  console.log(e.code);
  if (e.code === "Enter") {
    urlClick.style.display = "none";
    console.log(e.code);
    const url = box.value;
    if (!url) {
      alert("You didn't enter any urls");
      urlClick.style.display = "none";
    } else {
      const timestamp = getRandomNumber();
      const frame = document.createElement("div");
      frame.setAttribute("class", "frame bookmark");
      frame.setAttribute("draggable", "true");
      frame.setAttribute("id", timestamp);
      frame.innerHTML = `<a href=${url} class="thumbnailUrl" target="_blank">
                          <div class="top">
                              <div class="thumbnail">
                                  <img src="./images/default.svg" width=250 class="default">
                              </div>
                          </div>
                          <div class="info">
                              <div class='title'>${"loading"}</div>
                          </div>
                          </a>
                          <div class="trashCan bookmarkTrash">
                              <img src="images/trash.svg" width="35px" height="35px">
                          </div>`;
      page.appendChild(frame);
      if (parent) {
        urlData = { id: timestamp, parent_id: parent, url: url, time: timestamp };
      } else {
        urlData = { id: timestamp, url: url, time: timestamp };
      }
      console.log(parentId);
      console.log(parent);
      console.log(urlData);
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          box.value = "";
          if (xhr.status !== 200) {
            alert("there's something wrong, please try again!");
          }
          console.log(xhr.responseText);
        }
      };
      xhr.open("post", "/api/1.0/test", true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      const data = JSON.stringify(urlData);
      console.log(data);
      xhr.send(data);
    }
  }
});

// document.addEventListener("mouseover", (e) => {
//   console.log(e.target);
// });
