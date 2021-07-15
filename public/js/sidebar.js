/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// Sidebar

const token = localStorage.getItem("accessToken");

if (!token) {
  alert("請先登入");
  window.location.href = "/sign.html";
}

const getNestData = async () => {
  const response = await fetch("/api/1.0/sidebar/details", {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  if (response.status !== 200) {
    alert("There's something wrong...");
    throw new Error("error");
  }
  const data = await response.json();
  return data;
};

function sideBarRender (obj, div) {
  if (!obj.children) {
    const item = document.createElement("div");
    item.id = "sidebar" + " " + obj.id;
    item.className = "bar_item" + " " + obj.name;
    item.innerHTML = obj.name;
    item.style.display = "none";
    div.appendChild(item);
  } else {
    const item = document.createElement("div");
    item.id = "sidebar" + " " + obj.id;
    item.className = "parentSideBar" + " " + obj.name;
    item.style.display = "none";
    item.innerHTML = `<button class=sidebar_button><img src="images/down-before.svg" class="downBefore"> ${obj.name}</button>`;
    // item.innerHTML = obj.name;
    div.appendChild(item);
    for (const n in obj.children) {
      sideBarRender(obj.children[n], item);
    }
  }
}

const sidebarContent = document.getElementById("sidebarContent");
getNestData().then(data => {
  for (const n in data) {
    sideBarRender(data[n], sidebarContent);
    const id = "sidebar" + " " + data[n].id;
    const parent = document.getElementById(id);
    parent.style.display = "block";
  };
});

sidebarContent.addEventListener("click", (e) => {
  const targetParent = e.target.parentNode.parentNode;
  const children = targetParent.children;
  const nameString = targetParent.className;
  const nameArr = nameString.split(" ");
  if (e.target.className === "downBefore") {
    children[0].innerHTML = `<img src="images/down.svg" class="down">${nameArr[1]}`;
    for (const n in children) {
      if (n >= 1) {
        children[n].style.display = "block";
        children[n].style.marginLeft = "3em";
      }
    }
  }
  if (e.target.className === "down") {
    children[0].innerHTML = `<img src="images/down-before.svg" class="downBefore">${nameArr[1]}`;
    for (const n in children) {
      if (n >= 1) {
        children[n].style.display = "none";
      }
    }
  }
});

const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
// eslint-disable-next-line no-unused-vars
function openSidebar () {
  hamburger.style.display = "none";
  homepage.style.display = "none";
  sidebar.style.display = "block";
}

// eslint-disable-next-line no-unused-vars
function closeSidebar () {
  hamburger.style.display = "block";
  hamburger.style.display = "flex";
  hamburger.style.justifyContent = "right";
  homepage.style.display = "block";
  sidebar.style.display = "none";
}

function logOut () {
  localStorage.removeItem("accessToken");
  location.href = "/sign.html";
}
