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



<script>
    d3.json("/api/1.0/nest", (d) => {
        return d;
    }).then((d)=>{
        const data = d;
        const a = d3.group(data, d=>d.id)
        console.log(a)
    })
</script>

 //"test": "echo \"Error: no test specified\" && exit 1",
