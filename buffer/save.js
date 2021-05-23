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
