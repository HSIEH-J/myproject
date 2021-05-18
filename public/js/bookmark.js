const box = document.getElementById("box");
const page = document.getElementById("page");

// function splitUrl (url) {
//     const iconArr = url.split('/');
//     const icon = iconArr[0] + '//' + iconArr[2];
//     return icon;
// }

// eslint-disable-next-line no-unused-vars
// function addBookmarkPage () {
//   const url = box.value;
//   const frame = document.createElement("div");
//   frame.setAttribute("class", "frame");
//   // const iconUrl = splitUrl(url);
//   // console.log(iconUrl)

//   frame.innerHTML = `<a href=${url} id="imgUrl">
//                        <div class="bookmark">
//                           <div class="top">
//                             <div class="pencil">
//                               <img src="../images/pencil.png">
//                             </div>
//                             <div class="image">
//                               <img src="http://capture.heartrails.com/medium?${url}" width=250>
//                             </div>
//                           </div>
//                           <div class="info">
//                             <div class='title'>用evernote完成更多事</div>
//                           </div>
//                        </div>
//                      </a>`;
//   page.appendChild(frame);
//   box.value = "";
// }

const getBookmarkData = async () => {
  const response = await fetch("/api/1.0/get");
  const data = await response.json();
  return data;
};

getBookmarkData().then(data => {
  for (const n of data.data) {
    const frame = document.createElement("div");
    frame.setAttribute("class", "frame");

    frame.innerHTML = `<a href=${n.address} id="imgUrl">
                       <div class="bookmark">
                          <div class="top">
                            <div class="pencil">
                              <img src="../images/pencil.png">
                            </div>
                            <div class="image">
                              <img src=${n.img} width=250>
                            </div>
                          </div>
                          <div class="info">
                            <div class='title'>${n.title}</div>
                          </div>
                       </div>
                     </a>`;
    page.appendChild(frame);
  }
});

// eslint-disable-next-line no-unused-vars
function addBookmarkPage () {
  const url = box.value;
  const urlData = { url: url };
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      box.value = "";
      console.log(xhr.responseText);
      const text = xhr.responseText;
      if (text === "true") {
        alert("書籤已插入...");
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

const plus = document.getElementById("plus");
const option = document.getElementById("option");
// const index = document.getElementById("index");
plus.addEventListener("click", () => {
  option.style.display = "block";
});

option.addEventListener("click", (e) => {
  const point = e.target.id;
  if (point === "carton") {
    const addCarton = document.createElement("div");
    addCarton.setAttribute("class", "newCarton");
    addCarton.innerHTML = "<img src=\"../images/carton.png\">";
    page.appendChild(addCarton);
  }
  option.style.display = "none";
});
