const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

let url = 'https://movie.douban.com/top250';
let page = 0; // 页数
let i = 1; // 当前页数

let Info = [];

function getTitles(page) {
    console.log("正在抓取第" + i + "页");

    https.get(url + '?start=' + page + '&filter=', res => {
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
                let $e = $(element);
                Info[page + index] = { "ChineseTitles": $e.text() };
            })

            // 爬取英文标题
            $('.grid_view .item .info .title:nth-child(2)').each(function (index, element) {
                let $e = $(element);
                Info[page + index].EnglishTitles = $e.text().replace('/', '').trim();
            })

            // 爬取其他标题
            $('.grid_view .item .info .other').each(function (index, element) {
                let $e = $(element);
                let arr = $e.text().split('/').filter(d => d.trim()).map(d => d.replace(/^\s+|\s+$/g, ""));
                Info[page + index].OtherTitles = arr;
            })

            // // 爬取评分
            $('.grid_view .item .info .bd .star .rating_num').each(function (index, element) {
                let $e = $(element);
                Info[page + index].Score = $e.text();
            })

            // 爬取各页面连接
            $('.grid_view .item .info .hd a').each(function (index, element) {
                let $e = $(element);
                Info[page + index].Link = $e.attr('href');
            })

            // getInfo(Info, 0)

            if (page < 225) {
                page += 25;
                i++;
                getTitles(page);
            } else {
                console.log("Step 1 done！");
                getInfo(Info, 0)
            }
        });
    });
}

function getInfo(Info, i) {
    console.log("正在抓取第" + (i + 1) + "部电影");

    let arr = Info
    https.get(arr[i].Link, res => {
        let chunks = [];

        res.on('data', chunk => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            let html = Buffer.concat(chunks);
            let $ = cheerio.load(html, { decodeEntities: false });

            // 抓取导演/编剧/主演
            $('#info .attrs').each(function (index, element) {
                let $e = $(element);
                if (index == 0) { // 抓取导演
                    arr[i].Director = $e.text();
                } else if (index == 1) { // 抓取编剧
                    arr[i].Screenwriter = $e.text();
                } else if (index == 2) { // 抓取主演
                    arr[i].Actor = $e.text();
                }
            })

            // 抓取类型
            let type = '';
            $('#info [property$="v:genre"]').each(function (index, element) {
                let $e = $(element);
                type = type + $e.text() + ' / ';
            })
            arr[i].Type = type.substring(0, type.length - 3)

            // 抓取国家/地区
            // $('#info .pl').each(function (index, element) {
            //     let $e = $(element);
            //     if (index == 4) {
            //         console.log($e.parent().children());
            //         arr[i].Country = $e;
            //         // console.log(arr[i].Country);
            //     }
            // })

            // 抓取上映时间
            let initialReleaseDate = '';
            $('#info [property$="v:initialReleaseDate"]').each(function (index, element) {
                let $e = $(element);
                initialReleaseDate = initialReleaseDate + $e.text() + ' / ';
            })
            arr[i].InitialReleaseDate = initialReleaseDate.substring(0, initialReleaseDate.length - 3)

            // // 抓取时长
            $('#info [property$="v:runtime"]').each(function (index, element) {
                let $e = $(element);
                arr[i].Runtime = $e.text();
            })

            if (i < 249) {
                i++;
                getInfo(arr, i);
            } else {
                console.log("Step 2 done！");
                saveData('./data/Info.json', arr);
            }
        });
    })
}

function saveData(path, content) {
    fs.writeFile(path, JSON.stringify(content, null, ' '), err => {
        if (err) return console.log(err);
        console.log('数据已保存！');
    });
}

getTitles(page);
