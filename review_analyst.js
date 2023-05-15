import ai from './ai.js';
import prompts from './prompts.js';
const SLICE_CHUNCK_MAX_NUM = 10;

function handle_first_prompts(json) {
    var data = "";
    json.painpoints.forEach(v => {
        if( v.mentioned == 1) {
            m += v.content + '\n';
        } else {
            for(var i=0;i<v.mentioned;i++) {
                m += v.content + '\n';
            }
        }
    });

    return data;
}
/**
 * 
 * step 00 产品
 * Which stuff is this description title talk about:
 * Meta Quest 2 - Advanced All-In-One Virtual Reality Headset - 128 GB (Renewed Premium)
 * Use up to 5 words to output the result.
 * ------------------
 * step 01
 * Act as an amazon buyer. When you buy "External hard drive with 2TB capacity.", what shortcomings do you think will make you dissatisfied and give a one star rating. 
 * List 10 items, and make sure your output fit this javascript array format: ["xxx","xxx","xxx"];
 * ------------------
 * step 02
 * Categorize below one star reviews by the following categories
 * [
        "Software bugs", 
        "Connectivity issues", 
        "Defective buttons/scroll wheel/sensor", 
        "Unresponsive customer support", 
        "Poor build quality", 
        "Inconvenient design/ergonomics", 
        "Overpriced", 
        "Loud or annoying noise", 
        "Inadequate software", 
        "Limited compatibility with operating systems", 
        "Poor battery life", 
        "Limited customization options", 
        "After-sales service",
        "Others"
    ]
    One review can only fit one Categorize. Each review has a specified id at the very beginning.
    Make sure that your output fit this json format:
    {"painpoints": [categorize: "Software bugs": relevant: [1,2,3]},{categorize: "Poor build quality", relevant: [1,2,3]}]}

    Explanation: "categorize" is the Categorize name provided above; "relevant" is ids of the the reviews that fit the Categorize.
 * 
 */

// 组装第一次调用openai 的prompts
function summary_start_prompts(sliced_raw_text) {
    const prompts = `
        
    Group the reviews by the similar description and Summarize them in one short sentence.
    Review content group by with 
    [
        "Software bugs", 
        "Connectivity issues", 
        "Defective buttons/scroll wheel/sensor", 
        "Unresponsive customer support", 
        "Poor build quality", 
        "Inconvenient design/ergonomics", 
        "Overpriced", 
        "Loud or annoying noise", 
        "Inadequate software", 
        "Limited compatibility with operating systems", 
        "Poor battery life", 
        "Limited customization options", 
        "Others"
    ]
    Each comment has a specified id at the very beginning.
    Make sure that your output in the specified json format:
    {"painpoints": [{content: "xxxxxxxx", metioned: 10, relevant: [1,2,3]},{content: "xxxx", metioned: 9,relevant: [1,2,3]}]}
        
    content: is the summaried review text; metioned: is the content or similar content metioned times; relevant: contain the Merged reviews ids
        
    Here are the reviews: 
            
        ${sliced_raw_text}
        
    `;

    return prompts;
}

/*
{"painpoints": [{content: "Mouse scroll wheel issues", mentioned: 4, relevant: [2,3,5,14]},
{content: "Poor quality/defects", mentioned: 3, relevant: [1,7,8]},
{content: "Size/uncomfortable for larger hands", mentioned: 2, relevant: [9,10]},
{content: "Jittery mouse", mentioned: 1, relevant: [11]},
{content: "Missing items in package", mentioned: 1, relevant: [12]},
{content: "Software issues", mentioned: 1, relevant: [13]}]}
*/

// 组装第二次调用 openai 的 prompts
function summary_end_prompts(summarized_reviews) {
    const rev = handle_first_prompts(summarized_reviews);
    const prompts = `
        
        Use the following data to summarize the top 5 mentioned issues, and provide with an accurate and short review report and suggestions for improvement.

        ${rev}
        
    `;

    return prompts;
}

// 按照10条评论一组 对所有评论切片
function chunkArray(array, chunkSize) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

// 为每组评论 创建一个api
function re_arrange_review(sliced_reviews_array, c) {
    return sliced_reviews_array.map(v => {
        var input_text = "";
        v.forEach(item => {
            input_text += `${item.id}. ${item.content} \n\n\n`;
        })
        
        const input = prompts.ReviewAnalysis(input_text, c);
        return ai.gpt(input);
    })
}

// 调动 n 次open api 接口，等待所有返回.
function summary_start(input, c) {
    const chuncks = chunkArray(input, 10);
    console.log("chuncks", chuncks.length);
    const func_promises = re_arrange_review(chuncks, c);
    // console.log("promise ", func_promises)
    return Promise.all(func_promises).then(summary_end).catch(console.log);
}

//将n次的结果 再次总结
function summary_end(result) {
    const json = result.map(item => {
        console.log(item[0].message.content)
        return JSON.parse(item[0].message.content);
    })
    // console.log(json);
    return json;
    // var all_sumaried_reviews = summary_end_prompts(inputs.jon("\n\n\n"));
    // return ai.gpt(all_sumaried_reviews).then(res => {
    //     console.log("review summarization all jobs done", res);
    // })
}

export default {
    summary_start
}
