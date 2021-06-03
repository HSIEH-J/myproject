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
const url = document.getElementById("url");

// document.addEventListener("click", (e) => {
//   console.log(e.target);
// });

importUrl.addEventListener("click", () => {
  url.style.display = "block";
});

box.addEventListener("click", (e) => {
  box.value = "";
});

box.addEventListener("keydown", (e) => {
  console.log(e.code);
  if (e.code === "Enter") {
    console.log(e.code);
    alert("enter");
    const url = box.value;
    const timestamp = getTimeStamp();
    const urlData = { url: url, time: timestamp };
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        box.value = "";
        console.log(xhr.responseText);
        const text = xhr.responseText;
        if (text === "true") {
          alert("書籤已插入...");
          location.reload();
        } else {
          alert("書籤製作中，請稍等...");
        }
      }
    };
    xhr.open("post", "/api/1.0/test", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    const data = JSON.stringify(urlData);
    console.log(data);
    xhr.send(data);
  }
});
