const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

let url = "https://www.formula1.com/en/drivers.html";

let info = [];

function getDrivers() {
  https.get(url, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      // firstName
      $(".listing-item--name span:nth-child(1)").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[index] = { firstName: $e.text() };
      });

      // lastName
      $(".listing-item--name span:nth-child(2)").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[index].lastName = $e.text();
        info[index].name = info[index].firstName + " " + info[index].lastName;
      });

      // avatar
      $(".listing-item--photo img").each(function (index, element) {
        let $e = $(element);
        info[index].avatar = $e.attr("data-src");
      });

      info.forEach((i, index) => {
        getDriverInfo(
          `${i.firstName.toLowerCase()}-${i.lastName.toLowerCase()}`,
          index
        );
      });
    });
  });
}

function getDriverInfo(name, order) {
  https.get(`https://www.formula1.com/en/drivers/${name}.html`, (res) => {
    let chunks = [];

    res.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res.on("end", () => {
      // 将一组Buffer对象合并为一个Buffer对象
      let html = Buffer.concat(chunks);
      let $ = cheerio.load(html, { decodeEntities: false });

      // Photo
      let $photo = $(".driver-main-image .fom-adaptiveimage");
      info[order].photo = $photo.attr("data-path")
        ? "https://www.formula1.com" +
          $photo.attr("data-path") +
          ".img.640.medium.jpg" +
          $photo.attr("data-suffix")
        : "";

      // Icn flag
      let $icnFlag = $(".icn-flag img");
      info[order].icnFlag = "https://www.formula1.com" + $icnFlag.attr("src");

      // Driver number
      let $driverNumber = $(".driver-number span:nth-child(1)");
      info[order].driverNumber = $driverNumber.text();

      // Team
      $(".stat-list tr:nth-child(1) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].team = $e.text();
      });

      // Country
      $(".stat-list tr:nth-child(2) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].country = $e.text();
      });

      // Podiums
      $(".stat-list tr:nth-child(3) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].podiums = $e.text();
      });

      // Points
      $(".stat-list tr:nth-child(4) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].points = $e.text();
      });

      // Grands Prix entered
      $(".stat-list tr:nth-child(5) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].grandsPrixEntered = $e.text();
      });

      // World Championships
      $(".stat-list tr:nth-child(6) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].worldChampionships = $e.text();
      });

      // Highest race finish
      $(".stat-list tr:nth-child(7) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].highestRaceFinish = $e.text();
      });

      // Highest grid position
      $(".stat-list tr:nth-child(8) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].highestGridPosition = $e.text();
      });

      // Date of birth
      $(".stat-list tr:nth-child(9) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].dateOfBirth = $e.text();
      });

      // Place of birth
      $(".stat-list tr:nth-child(10) .stat-value").each(function (
        index,
        element
      ) {
        let $e = $(element);
        info[order].placeOfBirth = $e.text();
      });

      saveData("../data/driver.json", info, name);
    });
  });
}

function saveData(path, content, name) {
  fs.writeFile(path, JSON.stringify(content, null, " "), (err) => {
    if (err) return console.log(err);
    console.log(`${name}数据已保存！`);
  });
}

getDrivers();
