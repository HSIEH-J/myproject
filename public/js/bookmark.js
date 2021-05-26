const box = document.getElementById("box");

function getTimeStamp () {
  const date = Date.now(); ;
  const timestamp = Math.floor(date / 1000); ;
  return timestamp;
}

// eslint-disable-next-line no-unused-vars
function addBookmarkPage () {
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
  const data = JSON.stringify(urlData);
  console.log(data);
  xhr.send(data);
};
