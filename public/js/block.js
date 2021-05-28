const create = document.getElementById("create");
create.addEventListener("click", (e) => {
  if (e.target.id === "blockIcon") {
    const div = document.createElement("div");
    div.setAttribute("class", "block");
    div.setAttribute("draggable", "true");
    // eslint-disable-next-line no-undef
    page.appendChild(div);
  }
});
