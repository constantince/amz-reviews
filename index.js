import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ai from './ai.js';
import analyst from './review_analyst.js';
import prompts from './prompts.js';
import { queryReviewsWithStars, savePageInfomation, queryPid, queryTheSuff, queryTheBullets } from './query.js';
import { generateUid } from './tools.js';
import testStr from './review_text.js';

var app = express();
app.use(cors())
// 之后每个响应头都会被设置
app.use(bodyParser.urlencoded({
 extended:true
}));

app.use(express.json());

app.post('/amz/api/comments', function(req, response){
//  console.log(req.body);
const {message} = req.body;
    if( !message ) {
        return response.json({
            code: "2",
            result: [],
            message: "should input something!"
        })
    }
    const m = `Using below text give me a summary, with in 30 words:
    
            ${message}
    `;
    ai.gpt(m).then(res => {
        response.json({
          code: "0",
          result: res.content,
          message: "OK"
        });
    })
    //  ai.query({
    //      inputs: message,
    //      parameters:{
    //          temperature: 100,
    //          min_length: 20,
    //          max_length: 60
    //      }
         
    //  }).then(res => {
    //   response.json({
    //       code: "0",
    //       result: res,
    //       message: "OK"
    //   });
    // })
 
});

app.get("/amz/bullist", function(req, res) {
    console.log(req.query)
    res.send(" get successfully!");
});

//插件点击获取差评分析后 保存界面信息
app.post("/amz/trigger/page/info", () => {
    const { reviews, bullets} = req.body;
    savePageInfomation({reviews, bullets}, () => {
        res.json({
            status: 'ok',
            message: 'information saved.'
        })
    })
})

//差评分析 
app.get("/amz/trigger/review/analysis", function(req, res) {
    
    const { star } = res.query;
    a(star).then(rawText => {
        summary_start(rawText);
        res.json({
            message: 'open ai to review summarization has triggered, review analyst engaging',
            staus: 'ok'
        })
    })
});

app.post('/amz/api/reviews', function(req, response){
//  console.log(req.body);
    const {reviews} = req.body;
    if( !reviews ) {
        return response.json({
            code: "2",
            result: [],
            message: "should input something!"
        })
    }
    const m = `
    
    Using the text I provide below, summarize the pros and cons of this product, with in 1000 words:
    
    Here is the example you should output: 
    
    pros:xxxxxxxx;
    \n\n###\n\n
    cons:xxxxxxxx;
    
    And here is the original source text:
    
    ${reviews.join('\n\n\n')}
    `;
    
    ai.gpt(m).then(res => {
        response.json({
          code: "0",
          result: res.content,
          message: "OK"
        });
    })

 
});


// 获取亚马逊界面的信息
app.post('/amz/api/pageinfo/', function(req, response) {
    //根据唯一的url生成唯一的uid
    const { user, title, url, reviews, bullets, product } = req.body;
    const pid = generateUid(url);
    // 查询商品是否存在
    queryPid(pid).then(res => {
        if( res === false) {
            savePageInfomation(pid, {reviews, bullets, title, user, product}).then(res => {
                if(res) {
                   response.json({
                       status: "ok",
                       message: "All data insert success!"
                   }) 
                } else {
                    response.json({
                       status: "failed",
                       message: "All data insert success!"
                   }) 
                }
               
            })
        } else { // 存在也一样返回成功
             response.json({
                   status: "ok",
                   message: "All data insert success!"
               })
        }
    })
});

// 开始好评分析
app.get('/amz/api/platform/anlyst_good_reviews', async (req, res) => {
    // pid 产品id； starts : 星级
    let { pid } = req.query;
    // 首先查询是什么商品
    let stuff = await queryTheSuff(pid);
    // console.log("stuff:", stuff[0].stuff);
    // //首先让ai分类
    // const message = prompts..CreateGoodSummaryCategories(stuff[0].stuff);
    // // console.log("message:", message)
    let categories = await ai.gpt(prompts.AlwaysReturnJson(
        
        `Fill the JSON string with 5 shortcomings that When I buy a broom, it makes me dissatify:
         {"reasons": {"desc": "xxxxx" id: 1}, {"desc": "xxxxx", id: 2}}
        `
        ));
    // console.log(categories[0].message.content);
    
    const filled = JSON.parse(categories[0].message.content);
    
    var a = "0: Other shortcomings; \n"; filled.reasons.forEach(v => a += v.id + ":" + v.desc + ';\n');
    
    
    
    console.log(a);
    
    // let reviews = await queryReviewsWithStars(["4", "5"], pid);
    // console.log("review length:", reviews.length);
    
    let answer = await ai.gpt(prompts.AlwaysReturnJson(
        
        `
         give you ${filled.reasons.length} categories and their id:
         ${a}
         And and give you reivews and their id:
         ${testStr}
         group the reviews's id with categories provided before, 
         And then fill the JSON string with categories id and relevant ids:
         {"painpoints": [{"categories id": xxxx, "relevant review ids": [2,3,5,14]}, {"categories id": x, "relevant review ids": [1,7,8]}]}
        `
        ));
        
        console.log(answer);
    // console.log("cates:", categories[0].message);
    // 查询所有评论
    // let reviews = await queryReviewsWithStars(["4", "5"], pid);
//     console.log("review length:", reviews.length);
    // const c = 
// ["Other", "Storage capacity", "Speed of data transfer", "Reliability and durability", "Compatibility with different devices", "Brand reputation", "Price", "Ease of use", "Portability and ease of transport", "Additional features (such as encryption)", "Availability of customer support"];
//     let summaries = await analyst.summary_start(reviews, c);
    
//     console.log("summaries:",summaries);
    
    res.json({
        summaries: categories[0].message.content,
        status: "debugger...",
        message: "program is in engaging..."
    })
    
    
    
    
    // queryReviewsWithStars(["1", "2"], pid).then(data => {
    //     if(data.length > 0) {
    //         //首先让ai分类
    //         ai.gpt(prompts.CreateBadSummaryCategories(stuff)).then(res => {
    //             console.log("badcategories", res[0].message.content);
    //         })
    //     } else {
    //         res.json({
    //             status:"failed",
    //             message: "data empty"
    //         })
    //     }
        
    // });
    
})


//开始差分析评论
app.get('/amz/api/platform/anlyst_bad_reviews', async (req, res) => {
    // pid 产品id； starts : 星级
    let { pid } = req.query;
    // 首先查询是什么商品
    let stuff = await queryTheSuff(pid);
    console.log("stuff:", stuff[0].stuff);
    //首先让ai分类
    const message = prompts.CreateBadSummaryCategories(stuff[0].stuff);
    console.log("message:", message)
    let categories = await ai.gpt(message);
    console.log("cates:", categories[0].message);
    // 查询所有评论
    let reviews = await queryReviewsWithStars(["1", "2"], pid);
    console.log("review length:", reviews.length);
    
    let summaries = await summary_start(reviews, categories[0].message + '\n Others');
    
    res.json({
        status: "debugger...",
        message: "program is in engaging..."
    })
    
    
    
    
    // queryReviewsWithStars(["1", "2"], pid).then(data => {
    //     if(data.length > 0) {
    //         //首先让ai分类
    //         ai.gpt(prompts.CreateBadSummaryCategories(stuff)).then(res => {
    //             console.log("badcategories", res[0].message.content);
    //         })
    //     } else {
    //         res.json({
    //             status:"failed",
    //             message: "data empty"
    //         })
    //     }
        
    // });
    
});

//开始生成bullets
app.post('/amz/api/platform/generate_new_bullets', (req, res) => {
    const { qid, keywords, brand } = req.body;
    console.log(brand, "\n", keywords);
    queryTheBullets(qid).then(bullets => {
        const list = bullets.map(v => v.content)
        if( bullets.length) {
            ai.gpt(prompts.NewBulletsIdeas(list.join('\n-'), brand, keywords.join("\n"))).then(x => {
                res.json({
                    status: "ok",
                    bullets: x[0].message.content
                }) 
            })    
           
        } else {
            res.json({
                status: "failed",
                bullets: [],
                message: "bullets list generated failed"
            })
        }
    })
});

app.listen(8088);