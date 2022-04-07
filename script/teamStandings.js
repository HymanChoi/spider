const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

let info = [];

function getTeamList(year, endYear) {
  let url = `https://www.formula1.com/en/results.html/${year}/team.html`;

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

      // TEAM
      $("tbody tr td:nth-child(3) a").each(function (index, element) {
        let $e = $(element);
        list[index].team = $e.text();
      });

      // NATIONALITY
      $("tbody tr td:nth-child(4)").each(function (index, element) {
        let $e = $(element);
        list[index].points = $e.text();
      });

      info.push({ id: year, list: list });
      console.log(`get ${year} data done`);

      if (year < endYear) {
        year++;
        getTeamList(year, endYear);
      } else {
        saveData("../data/teamStandings.json", info);
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

getTeamList(2010, 2022);
