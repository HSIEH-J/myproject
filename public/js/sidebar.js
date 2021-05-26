// Sidebar
// eslint-disable-next-line camelcase
const bar_block = document.querySelector(".bar_block");
const hamburger = document.querySelector(".hamburger");
const mainHeader = document.querySelector("#mainHeader");
const screen = document.querySelector(".screen");
const container = document.querySelector("#container");
// eslint-disable-next-line no-unused-vars
function openSidebar () {
  mainHeader.style.justifyContent = "flex-end";
  hamburger.style.display = "none";
  screen.style.display = "flex";
  bar_block.style.display = "block";
  container.style.width = "90vw";
}

// eslint-disable-next-line no-unused-vars
function closeSidebar () {
  mainHeader.style.justifyContent = "space-between";
  container.style.width = "100vw";
  hamburger.style.display = "block";
  bar_block.style.display = "none";
}

const getNestData = async () => {
  const response = await fetch("/api/1.0/nest");
  const data = await response.json();
  return data;
};

const sidebarContent = document.getElementById("sidebarContent");
getNestData().then(data => {
  // console.log(data);
  for (const n in data) {
    if (data[n].children === undefined) {
      const item = document.createElement("div");
      item.innerHTML = data[n].name;
      // console.log(data[n].name);
      item.setAttribute("class", "bar_item");
      item.setAttribute("id", data[n].id);
      sidebarContent.appendChild(item);
    } else {
      const item = document.createElement("div");
      item.innerHTML = `<button class=sidebar_button id=${data[n].id}>&blacktriangleright; ${data[n].name}</button>`;
      console.log(data[n].name);
      item.setAttribute("class", "dropdown_hover");
      const num = parseInt(data[n].id) + parseInt(1);
      item.setAttribute("id", num);
      // item.setAttribute("id", data[n].id);
      sidebarContent.appendChild(item);
    }
  };
  sidebarContent.addEventListener("click", (e) => {
    if (e.target.className !== "bar_item close_button") {
      const arr = e.target.textContent.split(" ");
      // console.log(arr);
      e.target.innerHTML = "&blacktriangledown;" + arr[1];
      const children = document.createElement("div");
      children.setAttribute("class", "dropdown_content");
      const parentDiv = e.target.parentNode.id;
      const parent = document.getElementById(parentDiv);
      const id = e.target.id;
      for (const n in data[id].children) {
        children.innerHTML += `<div class="bar_item down">${data[id].children[n].name}</div>`;
      }
      parent.appendChild(children);
    }
  });
});

// nested structure
// eslint-disable-next-line camelcase
// const dropdown_hover = document.querySelector(".dropdown_hover");
// // eslint-disable-next-line camelcase
// const dropdown_content = document.querySelector(".dropdown_content");
// // eslint-disable-next-line camelcase
// const sidebar_button = document.querySelector(".sidebar_button");
// // dropdown_hover.addEventListener("mouseenter", (e) => {
//   e.target.style.background = "Gainsboro";
//   sidebar_button.style.color = "SlateGrey";
//   dropdown_content.style.display = "block";
//   dropdown_content.style.background = "WhiteSmoke";
//   dropdown_content.style.color = "sliver";
// });

// dropdown_hover.addEventListener("mouseleave", (e) => {
//   e.target.style.background = "transparent";
//   sidebar_button.style.color = "WhiteSmoke";
//   // dropdown_content.style.display = "none";
// });

// <!-- <div class="bar_item">File 1</div>
//                 <div class="bar_item">File 2</div>
//                 <div class="dropdown_hover">
//                   <button class="sidebar_button">Carton &blacktriangledown;</button>
//                   <div class="dropdown_content" style="display: none">
//                     <div class="bar_item down">File 1</div>
//                     <div class="bar_item down">File 2</div>
//                   </div>
//                 </div>
//                 <div class="bar_item">File 3</div> -->
