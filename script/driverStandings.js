const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

let info = [];

function getDriverList(year, endYear) {
  let url = `https://www.formula1.com/en/results.html/${year}/drivers.html`;

  https.get(url, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });
      let list = [];

      // POS
      $("tbody tr td:nth-child(2)").each(function (index, element) {
        let $e = $(element);
        list[index] = { position: $e.text() };
      });

      // DRIVER
      $("tbody tr td:nth-child(3) .hide-for-tablet").each(function (
        index,
        element
      ) {
        let $e = $(element);
        list[index].driver = $e.text();
      });
      $("tbody tr td:nth-child(3) a .hide-for-mobile").each(function (
        index,
        element
      ) {
        let $e = $(element);
        list[index].driver += " " + $e.text();
      });

      // NATIONALITY
      $("tbody tr td:nth-child(4)").each(function (index, element) {
        let $e = $(element);
        list[index].nationality = $e.text();
      });

      // CAR
      $("tbody tr td:nth-child(5) a").each(function (index, element) {
        let $e = $(element);
        list[index].car = $e.text();
      });

      // PTS
      $("tbody tr td:nth-child(6)").each(function (index, element) {
        let $e = $(element);
        list[index].points = $e.text();
      });

      info.push({ id: year, list: list });
      console.log(`get ${year} data done`);

      if (year < endYear) {
        year++;
        getDriverList(year, endYear);
      } else {
        saveData("../data/driverStandings.json", info);
      }
    });
  });
}

function saveData(path, content) {
  fs.writeFile(path, JSON.stringify(content, null, " "), (err) => {
    if (err) return console.log(err);
    console.log("数据已保存！");
  });
}

getDriverList(2010, 2022);
