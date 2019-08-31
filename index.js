const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

let url = 'https://movie.douban.com/top250?start=';
let page = 0;
let index = 1;

let Info = [];

function getTitles(page) {
    console.log("正在抓取第" + index + "页");

    https.get(url + page + '&filter=', res => {
        let chunks = [];
        res.on('data', chunk => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            // 将一组Buffer对象合并为一个Buffer对象
            let html = Buffer.concat(chunks);
            let $ = cheerio.load(html, { decodeEntities: false });

            $('.grid_view .item .info .title:nth-child(1)').each(function (index, element) {
                let $element = $(element);
                Info[index] = { "ChineseTitles": $element.text() };
            })

            // $('.grid_view .item .info .title:nth-child(2)').each(function (index, element) {
            //     let $element = $(element);
            //     Info[index].EnglishTitles = $element.text().replace('/', '').trim();
            // })

            $('.grid_view .item .info .other').each(function (index, element) {
                let $element = $(element);
                let arr = $element.text().trim().split('/');
                Info[index].OtherTitles = arr;
            })

            console.log(Info)

            // if (page < 225) {
            //     page += 25;
            //     index++;
            //     getTitles(page);
            // } else {
            //     console.log("Info获取完毕！");
            //     saveData('./data/Info.json', Info);
            // }
        });
    });
}

function saveData(path, content) {
    fs.writeFile(path, JSON.stringify(content, null, ' '), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('数据已保存！');
    });
}

getTitles(page)