const { getTitle, uploadS3, insertContainerData, getContainerData } = require("../models/screenshot_model");

const thumbnailData = async (req, res, next) => {
  const socket = req.app.get("socket");
  // try {
  // get url
  const url = req.body.url;
  const titleData = await getTitle(url);
  console.log(titleData);
  // get url title => check if status = done
  // if not => get API every 3's util the status is done
  if (titleData.status !== "done") {
    const test = async function () {
      let titleData = await getTitle(url);
      console.log(titleData);
      if (titleData.status !== "done") {
        console.log("===setTimeout===");
        titleData = await getTitle(url);
        console.log(titleData);
      } else {
        clearInterval(this);
        const title = titleData.title;
        console.log(title);
        const location = await uploadS3(url);
        console.log(location);
        const insert = { address: url, title: title, img: location };
        await insertContainerData(insert);
        console.log(socket.id);
        socket.emit("done");
      }
    };
    setInterval(test, 6000);
    res.send(false);
  } else {
    const title = titleData.title;
    console.log(title);
    const location = await uploadS3(url);
    console.log(location);
    const insert = { address: url, title: title, img: location };
    await insertContainerData(insert);
    res.send(true);
  }

  // } catch (err) {
  //   next(err);
  // }
};

const containerData = async (req, res, next) => {
  const dataObj = { data: [] };
  const data = await getContainerData();
  for (const n of data) {
    dataObj.data.push({ address: n.address, title: n.title, img: n.img });
  }
  res.send(dataObj);
};

module.exports = { thumbnailData, containerData };
