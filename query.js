import mysql from "mysql";
import ai from './ai.js';
import analyst from './prompts.js';
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'aiamzplus',
  password : 'dLLbPFHcbHNfpGHR',
  database : 'aiamzplus'
});

connection.connect();
const LIMIT = 50;

//查询差评列表
function queryReviewsWithStars(star, pid) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM \`amz-plus-review\` WHERE pid = '${pid}' and star IN (${star.join(",")})`, function(err, result, fields) {
            if(err) return resolve(err);
            resolve(result);
        });
    })
}

function savePageInfomation(pid, data) {
    return Promise.all([insertProducts(pid, data.title, data.user, data.product), insertBullets(pid, data.bullets), insertReviews(pid, data.reviews)]).then(([a, b, c])=> {
        console.log("a:", a, "b:", b, "c:", c);
        if( a + b + c === 0) return true;
        else false;
    });
}

//插入产品信息
function insertProducts(pid, title, user, stuff) {
    return new Promise((resolve, reject) => {
            console.log("this product a :", stuff);
            connection.query(
                'INSERT INTO `amz-plus-products` (pid, user, name, date, stuff) VALUES' +
                `('${pid}', '${user}', '${title}', '${Date.now()}', '${stuff}')`,
                function (error, results, fields) {
                    if (error) throw error;
                    if( results.length > 0) {
                        resolve(1)
                    }
                    resolve(0);
                }
            );
    })
}

// 插入描述列表
function insertBullets(pid, bullets) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO `amz-plus-bullets` (pid, content) VALUES ?',
            [bullets.map(item => [pid, item])],
            function (error, results, fields) {
                if (error) throw error;
                if( results.length > 0) {
                    resolve(1);
                }
                resolve(0);
            }
        );
    })
}


// 插入评论分析
function insertReviews(pid, reviews) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO `amz-plus-review` (pid, asin, title, content, star) VALUES ?',
            [reviews.map(item => [pid, item.asin, item.title, item.content, item.star])],
            function (error, results, fields) {
                if (error) throw error;
                if( results.length > 0) {
                    resolve(1);
                }
                resolve(0);
            }
        );
    })
}

function queryTheSuff(pid) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM `amz-plus-products` WHERE pid =\'' + pid + "'",
            function (error, results, fields) {
                if (error) throw error;
                if( results.length > 0) {
                    resolve(results);
                }
                resolve([]);
            }
        );
    })
}

function queryTheBullets(pid) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM `amz-plus-bullets` WHERE pid =\'' + pid + "'",
            function (error, results, fields) {
                if (error) throw error;
                if( results.length > 0) {
                    resolve(results);
                }
                resolve([]);
            }
        );
    })
}

function queryPid(pid) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM `amz-plus-products` WHERE pid =\'' + pid + "'",
            function (error, results, fields) {
                if (error) throw error;
                console.log("pid result:", results)
                if( results.length > 0) {
                    resolve(true);
                }
                resolve(false);
            }
        );
    })
}





export {
    queryReviewsWithStars,
    savePageInfomation,
    insertReviews,
    queryPid,
    queryTheSuff,
    queryTheBullets
}