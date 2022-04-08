const cheerio = require("cheerio");
const https = require("https");

function getDriverInfo() {
  https.get(
    `https://www.formula1.com/en/drivers/charles-leclerc.html`,
    (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        // 将一组Buffer对象合并为一个Buffer对象
        let html = Buffer.concat(chunks);
        let $ = cheerio.load(html, { decodeEntities: false });

        let $e = $(".driver-main-image .fom-adaptiveimage");
        console.log(
          "https://www.formula1.com" +
            $e.attr("data-path") +
            ".img.640.medium.jpg" +
            $e.attr("data-suffix")
        );
      });
    }
  );
}

getDriverInfo();
