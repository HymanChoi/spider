const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

let url = "https://www.formula1.com/en/drivers.html";

let info = [];

function getRacerList() {
  https.get(url, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      // POS
      $("tbody tr td:nth-child(2)").each(function (index, element) {
        let $e = $(element);
        info[index] = { position: $e.text() };
      });

      // DRIVER
      $("tbody tr td:nth-child(3) .hide-for-tablet").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[index].driver = $e.text();
      });

      saveData("../data/driver.json", info);
    });
  });
}

function saveData(path, content) {
  fs.writeFile(path, JSON.stringify(content, null, " "), (err) => {
    if (err) return console.log(err);
    console.log("数据已保存！");
  });
}

getRacerList();
