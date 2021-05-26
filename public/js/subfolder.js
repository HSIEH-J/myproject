// // const url = location.href;
// // const id = url.split("=")[1];

// const getData = async (id) => {
//   const response = await fetch(`/api/1.0/get?id=${id}`);
//   const data = await response.json();
//   return data;
// };

// // eslint-disable-next-line no-unused-vars
function folderClick (e) {
  console.log(e.className);
//   const id = e.id;
//   console.log(id);
//   // eslint-disable-next-line no-undef
//   page.innerHTML = "";
//   getData(id).then(data => {
//     console.log(data);
//     const get = data.data;
//     for (const n in get) {
//       if (get[n].folder_name === undefined) {
//         console.log("===undefined===");
//         const frame = document.createElement("div");
//         frame.setAttribute("class", "frame bookmark");
//         frame.setAttribute("draggable", "true");
//         frame.setAttribute("id", `${get[n].id}`);
//         frame.innerHTML = `<a href=${get[n].url} class="thumbnailUrl" target="_blank">
//                            <div class="top">
//                               <div class="pencil">
//                                 <img src="../images/pencil.png">
//                               </div>
//                               <div class="thumbnail">
//                                 <img src=${get[n].thumbnail} width=250>
//                               </div>
//                            </div>
//                            <div class="info">
//                               <div class='title'>${get[n].title}</div>
//                            </div>
//                            </a>`;
//         // eslint-disable-next-line no-undef
//         page.appendChild(frame);
//       } else {
//         const addCarton = document.createElement("div");
//         addCarton.setAttribute("class", "frame folderItem");
//         // addCarton.setAttribute("id", "d71d8a71-7ea5-421e-88ec-ff19eb982e2b");
//         addCarton.setAttribute("draggable", "true");
//         addCarton.setAttribute("onclick", "folderClick(this)");
//         addCarton.setAttribute("id", `${get[n].id}`);
//         addCarton.innerHTML = `<div>
//                                 <img src="images/folder-2.png" class="newFolder">
//                                </div>
//                                <div>
//                                 <input type="text" class="folderName" value="${get[n].folder_name}" id="folder${n}">
//                                </div>`;
//         // eslint-disable-next-line no-undef
//         page.appendChild(addCarton);
//       }
//     }
//   });
//   const parentId = document.createElement("div");
//   const container = document.getElementById("container");
//   parentId.setAttribute("id", "parent_id");
//   parentId.style.display = "none";
//   parentId.innerHTML = e.id;
//   container.appendChild(parentId);
}
