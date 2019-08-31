const mysql = require('../util/db');

function get(id) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`SELECT * FROM pet WHERE id=${id}`, function (err, result) {
            if (err) {
                reject(`Query Error in Table pet: ${err}`);
            }
            else if (result.length == 0) {
                reject('id Error in pet Table');
            }
            else {
                resolve(parseResult(result));
            }
        });
    });
}
function list(category, paging, size) {
    let offset = paging * size;
    let filter = '';
    return new Promise(function (resolve, reject) {
        switch (category) {
            case 'all':
                break;
            case 'cat':
                filter = `WHERE kind = '貓'`;
                break;
            case 'dog':
                filter = `WHERE kind = '狗'`;
                break;
            default:
                reject({ error: "Wrong Request" });
        }
        mysql.con.query(`SELECT COUNT(id) AS total FROM pet ${filter}`, function (err, result) {
            let body = {};
            if (err) reject(`Query Error in Table pet: ${err}`);
            else {
                maxPage = Math.floor(result[0].total / size);
                if (paging < maxPage) body.paging = paging + 1;

                mysql.con.query(`SELECT * FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
                    if (err) reject(`Query Error in Table pet: ${err}`);
                    else {
                        if (result.length == 0) {
                            body.data = [];
                        }
                        else {
                            parseResult(result);
                            body.data = result;
                        }
                        resolve(body);
                    }
                });
            }
        });
    });
}
function parseResult(result) {
    for (let i = 0; i < result.length; i++) {
        result[i].image = JSON.parse(result[i].image);
        result[i].description = JSON.parse(result[i].description);
        result[i].habit = JSON.parse(result[i].habit);
        result[i].story = JSON.parse(result[i].story);
        result[i].limitation = JSON.parse(result[i].limitation);
    }
    return result;
}
module.exports = { list, get }