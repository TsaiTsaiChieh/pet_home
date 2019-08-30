const modules = require('../util/modules');
const mysql = require('../util/db');
const url = 'http://www.meetpets.org.tw';

// 爬認養資訊
// 1. 先爬總共的隻數（一頁有 46 項資料）
// 2. 
// modules.async.waterfall([], function (err, result){});

function countyTable(countyString) {
    switch (countyString) {
        case '台北市':
            return 2;
        case '新北市':
            return 3;
        case '基隆市':
            return 4;
        case '宜蘭縣':
            return 5;
        case '桃園縣':
            return 6;
        case '新竹縣':
            return 7;
        case '新竹市':
            return 8;
        case '苗栗縣':
            return 9;
        case '台中市':
            return 10;
        case '彰化縣':
            return 11;
        case '南投縣':
            return 12;
        case '雲林縣':
            return 13;
        case '嘉義縣':
            return 14;
        case '嘉義市':
            return 15;
        case '台南市':
            return 16;
        case '高雄市':
            return 17;
        case '屏東縣':
            return 18;
        case '花蓮縣':
            return 19;
        case '台東縣':
            return 20;
        case '澎湖縣':
            return 21;
        case '金門縣':
            return 22;
        case '連江縣':
            return 23;
        // default:
        //     return 0;
    }
}
function neuterTable(neuterString) {
    switch (neuterString) {
        case '是':
            return 'F';
        case '否':
            return 'F';
        default:
            return 'N';
    }
}
function ageTable(ageString) {
    if (ageString.includes('年')) return 'A';
    else return 'C';
}
function crawler(species) {
    modules.async.waterfall([
        // 先爬各種類的最後 page 數
        function (next) {
            modules.request({ url: `${url}/pets/${species}`, method: 'GET' }, function (err, response, body) {
                if (err) {
                    console.log('fintLastPage function 失敗');
                    return
                }
                else if (!err && response.statusCode == 200) {
                    var $ = modules.cheerio.load(body);
                    const pager_last = $('.pager-last');
                    var index = pager_last[0].attribs.href.search('page=');
                    next(null, pager_last[0].attribs.href.substr(index + 5));
                }
            });
        },
        function (lastPage, next) {
            // 爬總隻數
            var contentURL = [];
            var loaded = -1;
            for (let i = 0; i <= lastPage; i++) {
                // for (let i = 0; i <= 0; i++) {
                // console.log(`${url}/pets/${species}?page=${i}`);
                modules.request({ url: `${url}/pets/${species}?page=${i}`, method: 'GET' }, function (err, response, body) {
                    if (err) {
                        console.log('info function 失敗');
                        return;
                    }
                    else if (!err && response.statusCode == 200) {
                        var $ = modules.cheerio.load(body);
                        var titles = $('.view-data-node-title a');
                        for (let j = 0; j < titles.length; j++) {
                            contentURL.push(titles[j].attribs.href);
                        }
                        loaded++;
                    }
                    if (loaded == lastPage) next(null, contentURL);
                    // if (loaded == lastPage) next(null, contentURL);
                });
            } // end for loop for latPage
        },
        // 將撈好的全部 URL 開始抓取每筆資料，並 push 在 data
        function (contentURL, next) {
            console.log(contentURL.length);
            var data = [];
            var loaded = 0;
            var kind = '';

            for (let i = 0; i < contentURL.length; i++) {
                setTimeout(function () {
                    console.log(`${i} seconds...`);
                    // console.log('url:', `${i},${url}${contentURL[i]}`);
                    modules.request({ url: `${url}${contentURL[i]}`, method: 'GET' }, function (err, response, body) {
                        // modules.request({ url: 'http://www.meetpets.org.tw/content/74351', method: 'GET' }, function (err, response, body) {
                        // modules.request({ url: 'http://www.meetpets.org.tw/content/74418', method: 'GET' }, function (err, response, body) {
                        if (err) {
                            // console.log(err);
                            console.log(`${i},${url}${contentURL[i]} contentURL function 失敗`);
                            return;
                        }
                        else if (!err && response.statusCode == 200) {
                            var $ = modules.cheerio.load(body);
                            // 寵物資訊
                            var link = contentURL[i].replace('/content/', '');
                            if (species == 'cat') {
                                kind = '貓';
                            }
                            else if (species == 'dog') {
                                kind = '狗';
                            }
                            var petName = $('.field-field-pet-name').children().children().text().replace('動物小名:', '').trim();
                            var age = $('.field-field-pet-age').children().children().text().replace('動物的出生日（年齡）:', '').replace('了', '').trim();
                            age = ageTable(age);
                            var neuter = $('.field-field-pet-medical').children().children().text().replace('結紮情況:', '').trim();
                            neuter = neuterTable(neuter);
                            var countyString = $('.field-field-county').children().children().text();
                            var county = countyTable(countyString);
                            var title = $('title').text().replace(' | 台灣認養地圖', '');
                            // var image = $('.field-field-pets-image');
                            var image = [];
                            // console.log($('.field-field-pets-image').children().children().length);
                            // console.log('test123', $('.field-field-pets-image').children());
                            // console.log('hhii.....', $('.field-field-pets-image').children().children());
                            for (let j = 0; j < $('.field-field-pets-image').children().children().length; j++) {
                                // console.log(j, $('.field-field-pets-image').children().children()[j].children[0].attribs.src);
                                image.push($('.field-field-pets-image').children().children()[j].children[0].attribs.src);
                            }
                            // console.log(image);
                            // var area = $('.field-field-filed-county-area').children().children().text();


                            var description = $('.field-field-pet-look').children().children().text().replace('簡單描述:', '').trim();
                            var habit = $('.field-field-pet-habitate').children().children().text().replace('動物個性略述:', '').trim();
                            // 認養資訊
                            // var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養資訊:', '').trim();
                            var story = $('.field-field-limitation-desc').children().children().text().slice(0, -1);
                            var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養條件:', '').trim().split('認養條件:');

                            // 聯絡人資訊
                            var contentName = $('.field-field-contact').children().children().text();
                            var contentTel = $('.field-field-tel').children().children().text().substring(255, -1);
                            let packData = { link, kind, petName, age, neuter, county, title, image, description, habit, story, limitation, contentName, contentTel };
                            // console.log(packData);
                            loaded++;
                            data.push(packData);
                        }
                        if (loaded === contentURL.length) next(null, data);
                    });
                }, 100 * i);
            } // end for loop
        },
        // 將全部資料開始餵入資料庫
        function (data, next) {
            // console.log('data.length', data.length);
            var insert_pet = [];
            var loaded = 0;
            for (let i = 0; i < data.length; i++) {
                insert_pet.push({
                    db: 2, db_link: data[i].link, kind: data[i].kind, petName: data[i].petName, age: data[i].age,
                    neuter: data[i].neuter, county: data[i].county, title: data[i].title,
                    image: JSON.stringify(data[i].image), description: JSON.stringify(data[i].description),
                    habit: JSON.stringify(data[i].habit), story: JSON.stringify(data[i].story),
                    limitation: JSON.stringify(data[i].limitation), contentName: data[i].contentName,
                    contentTel: data[i].contentTel
                });
                // console.log(insert_pet);

                loaded++;
                if (loaded === data.length) next(null, insert_pet);
            }
        },
        function (pet_data, next) {
            console.log(pet_data.length);
            pet_data.forEach(element => {
                mysql.con.query('INSERT INTO pet SET ?', element, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    console.log(result);
                });
            });
        }
    ], function (err, result) {
        if (err) throw err;
        // else console.log(result);
    });
}
crawler('cat');
crawler('dog');


// function fintLastPage(species) {
//     return new Promise(function (resolve, reject) {
//         modules.request({ url: `${url}${species}`, method: 'GET' }, function (err, response, body) {
//             if (err) {
//                 reject('fintLastPage function 失敗');
//                 return
//             }
//             else if (!err && response.statusCode == 200) {
//                 var $ = modules.cheerio.load(body);
//                 const pager_last = $('.pager-last');
//                 var index = pager_last[0].attribs.href.search('page=');
//                 resolve(pager_last[0].attribs.href.substr(index + 5));
//             }
//         });
//     });
// }

// function info(lastPage, species) {
//     var contentURL = [];
//     // contentURL[contentURL.length - 1]
//     // var flag = true;
//     const x = new Promise(function (resolve, reject) {
//         for (let i = 0; i <= lastPage; i++) {
//             // console.log(`${url}${species}?page=${i}`);
//             modules.request({ url: `${url}${species}?page=${i}`, method: 'GET' }, function (err, response, body) {
//                 if (err) {
//                     reject('info function 失敗');
//                 }
//                 else if (!err && response.statusCode == 200) {
//                     var $ = modules.cheerio.load(body);
//                     var titles = $('.view-data-node-title a');
//                     for (let j = 0; j < titles.length; j++) {
//                         contentURL.push(titles[j].attribs.href);
//                     }
//                 }
//                 // resolve(contentURL);
//                 // console.log(`${species} length: ${contentURL.length}`);
//             });
//             // console.log(i);
//             // callback(resolve(contentURL));
//             // console.log(`${species} length: ${contentURL.length}`);
//             // resolve(contentURL);
//         }
//         x.then(function (contentURL) {
//             console.log(contentURL);

//             return resolve(contentURL);
//         })
//         // 
//         // return resolve(contentURL);

//     });

// }
// fintLastPage('cat').then(function (lastPage) {
//     info(lastPage, 'cat').then(function (url) {
//         console.log(`length:${url.length}`);
//     });
// }, function (err) {
//     console.log(err);
// });
// fintLastPage('dog').then(function (lastPage) {
//     info(lastPage, 'dog').then(function (url) {
//         console.log(`length:${url.length}`);
//     });
// }, function (err) {
//     console.log(err);
// });

// function test() {
//     var a = [];
//     for (let i = 0; i < 10; i++) {
//         a.push(i);
//     }
//     console.log(a);
// }
// test();


// fintLastPage('dog');
// console.log(catLastPage);

// modules.request({ url: `${url}cat`, method: "GET" }, function (err, response, body) {
//     var result = [];
//     if (!err && response.statusCode == 200) {
//         // body 為原始碼，使用 cheerio.load 將字串轉換為 cheerio(jQuery) 物件
//         // var $ = modules.cheerio.load(body, { decodeEntities: false });
//         var $ = modules.cheerio.load(body);
//         // 貓首頁的標題，一頁有 46 隻
//         var titles = $(".view-data-node-title a");
//         console.log(titles.length);

//         // console.log(titles.text());
//         // console.log('titles:', titles[0].attribs.href);
//         for (let i = 0; i < titles.length; i++) {
//             result.push(titles[i].attribs.href);
//         }
//     }
//     console.log(result);
// });