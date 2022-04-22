const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

const links = require("../data/links.json");
const drivers = require("../data/drivers.json");

/**
 * 获取所有车手链接
 */
function getLinks() {
  let links = [];
  https.get("https://www.racing-statistics.com/en/f1-drivers", (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      $(`.letterboxes tr a`).each(function (index, element) {
        let $e = $(element);
        console.log(index);
        links.push($e.attr("href"));
      });

      saveData("../data/links.json", links);
    });
  });
}

/**
 * 含空格字符串转驼峰
 *
 * @param {*} name
 * @returns
 */
function toHump(name) {
  let newName = name.replace(/\s/g, "_");
  return newName.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

/**
 * 保存文件
 *
 * @param {*} path
 * @param {*} content
 * @param {*} name
 */
function saveData(path, content, name = "") {
  fs.writeFile(path, JSON.stringify(content, null, " "), (err) => {
    if (err) return console.log(err);
    console.log(`${name}数据已保存！`);
  });
}

/**
 *
 * @param {*} url
 * @param {*} index
 */
function getDriverInfo(url, index) {
  let driver = {
    name: "",
    nationality: "",
    birthDate: "",
    age: "",
    winsList: [],
    polePositionsList: [],
    teams: [],
  };

  let divLen = 0;

  https.get(url, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      let $image = $(".driverimage");
      divLen = $image.length;

      // PERSONALIA
      let $name = $("h1[itemprop='name']");
      driver.name = $name.text();

      let $nationality = $("span[itemprop='nationality']");
      driver.nationality = $nationality.text();

      let $birthDate = $('[itemprop="birthDate"]');
      driver.birthDate = $birthDate.attr("datetime");

      let $age = $("tbody tr:nth-child(2) td:nth-child(2) span:nth-child(2)");
      driver.age = $age.text().slice(1, -1);

      // STATISTICS
      $(
        "body > div:nth-child(13) > div:nth-child(6) > div:nth-child(1) > div:nth-child(4) > fieldset:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr"
      ).each(function () {
        let arr = [];
        $(this)
          .children("td")
          .each(function (i) {
            switch (i) {
              case 0:
                arr.push(toHump($(this).text().trim().slice(0, -1)));
                break;
              case 1:
                arr.push(
                  $(this)
                    .text()
                    .replace(/\s+/g, "")
                    .replace("pointsperraceavg", "/race")
                );
                break;
            }
          });
        driver[arr[0]] = arr[1];
      });

      // WINS
      $(
        `body > div:nth-child(13) > div:nth-child(6) > div:nth-child(1) > div:nth-child(${
          divLen + 7
        }) > fieldset:nth-child(1) > table:nth-child(2) > tbody:nth-child(2) > tr`
      ).each(function () {
        let obj = {};
        $(this)
          .children("td")
          .each(function (j) {
            switch (j) {
              case 0:
                obj.id = $(this).text();
                break;
              case 1:
                obj.event = $(this).text();
                break;
              case 2:
                obj.round = $(this).text().trim();
                break;
              case 3:
                obj.constructor = $(this).text();
                break;
            }
          });
        driver.winsList.push(obj);
      });

      // POLE POSITIONS
      $(
        `body > div:nth-child(13) > div:nth-child(6) > div:nth-child(1) > div:nth-child(${
          divLen + 7
        }) > fieldset:nth-child(2) > table:nth-child(2) > tbody:nth-child(2) > tr`
      ).each(function () {
        let obj = {};
        $(this)
          .children("td")
          .each(function (j) {
            switch (j) {
              case 0:
                obj.id = $(this).text();
                break;
              case 1:
                obj.event = $(this).text();
                break;
              case 2:
                obj.round = $(this).text().trim();
                break;
              case 3:
                obj.constructor = $(this).text();
                break;
            }
          });
        driver.polePositionsList.push(obj);
      });

      // TEAMS & TEAMMATES
      $(
        `body > div:nth-child(13) > div:nth-child(6) > div:nth-child(1) > div:nth-child(${
          divLen + 8
        }) > fieldset:nth-child(1) > table:nth-child(2) > tbody:nth-child(2) > tr`
      ).each(function () {
        let obj = {};
        $(this)
          .children("td")
          .each(function (j) {
            switch (j) {
              case 0:
                obj.season = $(this).text();
                break;
              case 1:
                let arr = [];
                $(this)
                  .children("a")
                  .each(function () {
                    arr.push($(this).text().trim());
                  });
                obj.teammate = arr;
                break;
              case 2:
                obj.team = $(this).text();
                break;
            }
          });
        driver.teams.push(obj);
      });

      drivers[index] = driver;
      saveData("../data/drivers.json", drivers, index);
    });
  });
}

function getDrivers(start, end) {
  let i = start;
  let timer = setInterval(function () {
    if (i < end) {
      getDriverInfo(links[i], i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, 3000);
}

getDrivers(0, 854);
