const getSearchData = async (param, keyword) => {
  const response = await fetch(`/api/1.0/search/${param}?keyword=${keyword}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      // eslint-disable-next-line no-undef
      Authorization: `Bearer ${token}`
    }),
    method: "GET"
  });
  const data = await response.json();
  return data;
};

const searchSelect = document.getElementById("searchSelect");
const search = document.getElementById("search");
// eslint-disable-next-line no-unused-vars
function searchItem () {
  const param = searchSelect.value;
  const keyword = search.value;
  // eslint-disable-next-line no-undef
  parentData.innerHTML = "";
  // eslint-disable-next-line no-undef
  page.innerHTML = "";
  getSearchData(param, keyword).then(data => {
    console.log(data);
    const receiveData = data.data;
    if (receiveData.length === 0) {
      page.innerHTML = "No result!";
    } else {
      for (const n of receiveData) {
        if (n.type === "bookmark") {
          const frame = document.createElement("div");
          frame.setAttribute("class", "frame bookmark");
          frame.setAttribute("draggable", "true");
          frame.setAttribute("id", `${n.id}`);
          frame.innerHTML = `<a href=${n.url} class="thumbnailUrl" target="_blank">
                              <div class="top">
                                  <div class="thumbnail">
                                    <img src=${n.thumbnail} width=250>
                                  </div>
                              </div>
                              <div class="info">
                                  <div class='title'>${n.title}</div>
                              </div>
                             </a>
                             <div class="trashCan bookmarkTrash">
                                <img src="images/trash.svg" width="35px" height="35px">
                             </div>`;
          // eslint-disable-next-line no-undef
          page.appendChild(frame);
        } else if (n.type === "folder") {

        } else {

        }
      }
    }
  });
}
