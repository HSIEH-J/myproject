const token = localStorage.getItem("accessToken");
// console.log(token);

if (!token) {
  alert("請先登入");
  window.location.href = "/sign.html";
}

// render main content data
const getBookmarkData = async () => {
  const response = await fetch("/api/1.0/get", {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  const data = await response.json();
  return data;
};

getBookmarkData().then(data => {
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
                              <div class="pencil">
                                <img src="../images/pencil.png">
                              </div>
                              <div class="thumbnail">
                                <img src=${get[n].thumbnail} width=250>
                              </div>
                           </div>
                           <div class="info">
                              <div class='title'>${get[n].title}</div>
                           </div>
                           </a>`;
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
      page.appendChild(addCarton);
    }
  }
});
