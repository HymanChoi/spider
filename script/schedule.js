const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

let url = "https://www.formula1.com/en/racing/2022.html";

let info = [];

function getSchedule() {
  https.get(url, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      // round
      $(".card-title").each(function (index, element) {
        let $e = $(element);
        info[index] = { cardTitle: $e.text() };
      });

      // month
      $(".month-wrapper").each(function (index, element) {
        let $e = $(element);
        info[index].month = $e.text();
      });

      // start-date
      $(".start-date").each(function (index, element) {
        let $e = $(element);
        info[index].startDate = $e.text();
      });

      // end-date
      $(".end-date").each(function (index, element) {
        let $e = $(element);
        info[index].endDate = $e.text();
      });

      // event-place
      $(".event-place").each(function (index, element) {
        let $e = $(element);
        info[index].eventPlace = $e.text().trim();
      });

      // event-title
      $(".event-title").each(function (index, element) {
        let $e = $(element);
        info[index].eventTitle = firstUpperCase($e.text().trim());
      });

      // event-title
      $(".event-image .track img").each(function (index, element) {
        let $e = $(element);
        info[index].track = $e.attr("data-src");
      });

      // country-flag
      $(".country-flag img").each(function (index, element) {
        let $e = $(element);
        info[index].countryFlagSrc = $e.attr("data-src");
      });

      saveData("../data/schedule.json", info);
    });
  });
}

function firstUpperCase(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

function saveData(path, content) {
  fs.writeFile(path, JSON.stringify(content, null, " "), (err) => {
    if (err) return console.log(err);
    console.log("数据已保存！");
  });
}

getSchedule();
