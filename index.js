const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

let url = 'https://movie.douban.com/top250?start=';
let page = 0;
let i = 1;

let Info = [];

function getTitles(page) {
    console.log("正在抓取第" + i + "页");

    https.get(url + page + '&filter=', res => {
        let chunks = [];
        res.on('data', chunk => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            // 将一组Buffer对象合并为一个Buffer对象
            let html = Buffer.concat(chunks);
            let $ = cheerio.load(html, { decodeEntities: false });

            // 爬取中文标题
            $('.grid_view .item .info .title:nth-child(1)').each(function (index, element) {
                let $element = $(element);
                Info[page + index] = { "ChineseTitles": $element.text() };
            })

            // 爬取英文标题
            $('.grid_view .item .info .title:nth-child(2)').each(function (index, element) {
                let $element = $(element);
                Info[page + index].EnglishTitles = $element.text().replace('/', '').trim();
            })

            // 爬取其他标题
            $('.grid_view .item .info .other').each(function (index, element) {
                let $element = $(element);
                let arr = $element.text().split('/').filter(d => d.trim()).map(d => d.replace(/^\s+|\s+$/g, ""));
                Info[page + index].OtherTitles = arr;
            })

            // 爬取评分
            $('.grid_view .item .info .bd .star .rating_num').each(function (index, element) {
                let $element = $(element);
                Info[page + index].Score = $element.text();
            })

            // 爬取各页面连接
            $('.grid_view .item .info .hd a').each(function (index, element) {
                let $element = $(element);
                Info[page + index].Link = $element.attr('href');
            })

            if (page < 225) {
                page += 25;
                i++;
                getTitles(page);
            } else {
                console.log("Title获取完毕！");
                console.log(Info);
                // getInfo(Info, 0)
                // saveData('./data/Info.json', Info);
            }
        });
    });
}

function getInfo(Info, i) {
    console.log("正在抓取第" + i + 1 + "部");
    let arr = Info
    let index = i
    https.get(arr[index].Link, res => {
        let chunks = [];
        res.on('data', chunk => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            let html = Buffer.concat(chunks);
            let $ = cheerio.load(html, { decodeEntities: false });

            // 抓取导演
            $('.article .subject span:nth-child(1) .attrs').each(function (index, element) {
                let $element = $(element);
                arr.Director = $element.text();
                // console.log($element.text());
            })

            if (index < arr.length) {
                index++
                getInfo(arr, index)
            } else {
                console.log(arr)
            }
        });
    })
}

function saveData(path, content) {
    fs.writeFile(path, JSON.stringify(content, null, ' '), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('数据已保存！');
    });
}

getTitles(page);
