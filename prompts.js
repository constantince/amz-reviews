/*
 * 
 messages: [
  {role: "system", content: "You are an amazon seller"},
  {role: "assistant", content: ""},
  {role: "user", content: input},
 ],
 */
function WhatIsTheProduct(title) {
    const user_input = `Which stuff is this description title talk about: \n
            "${title}"\n
            Limit your output to five words or less.`;
            
    return  {
        messages: [
          {role: "system", content: "You are an amazon seller"},
          {role: "user", content: user_input},
        ]};
        
}

function CreateGoodSummaryCategories(product) {
    //const user_input = `List 10 the reasons of the "${product}" that are evaluated by most peoples shopping on amazon when they give 4 or 5 star. No need number or symbol at the beginning.\n
                        //each one limit in 5 or less words.`;
                        
    const user_input = `List 40 the reasons of the "${product}" that are evaluated by most peoples shopping on amazon when they give 4 or 5 star. No other words but with this array format: [xxx,xxx,xxxx, ......]`;
    return  {
        messages: [
          {role: "system", content: "You are an amazon seller"},
          {role: "user", content: "You only can output text with this format: [xxx, xxx,xxxx]. Now list 10 numbers"},
           {role: "assistant", content: "[1,2,3,4,5,6,7,8,9,10]"},
           {role: "user", content: "Good, List the top five economies."},
           {role: "assistant", content: `["USA", "China", "Japan", "Germany", "India"]`},
           {role: "user", content: user_input }
        ],
        temperature: 1.13,
        
    };
}

function CreateBadSummaryCategories(product) {
    const user_input = `List 40 the reasons of the "${product}" that are evaluated by most peoples shopping on amazon when they give 1 star. No need number or symbol at the beginning.\n
                        each one limit in 5 or less words.`;
    return  {
        messages: [
          {role: "system", content: "You are an amazon seller"},
          {role: "user", content: user_input
          }
        ],
        temperature: 1.13,
        
    };
    
}

function ReviewAnalysis(review, categories) {
     const input_message = {
        messages: [
          {role: "system", content: "You are an amazon review anlysis expert"},
          {role: "user", content: `
          I am going to group some text to the categories array provide below:\n
          ${JSON.stringify(categories)}
          Each review has a specified id at the very beginning.\n
          Make sure that your output fit this json format:\n
          {"painpoints": [categorize: x: relevant: [x,x,x]},{categorize: x, relevant: [x,x,x]}]} \n
          Only "painpoints", "categorize", "relevant" filed can appear in the json string.\n
          One review can only fit one Categorize.
          Explanation: "categorize" is the number of Categorize\'index in the array provided above; "relevant" is ids of the the reviews that fit the Categorize. No other words`
          },
          {role: "user", content: `Revews: \n ${review}`}
        ]
        
    };
    // console.log(input_message.messages[1].content);
   return input_message
}

function AlwaysReturnJson(q) {
     const input_message = {
        messages: [
          {role: "system", content: "You are JSON responser"},
          {role: "user", content: `From now on, response any question using JSON string that i will instruct you at the end of the text. Do not break line. Are you readly?\n 
        {text: xxxxxxxxx}`
          },
          {role: "assistant", content: `{text: "sure, I will do it."}`},
          {role: "user", content: "Fill your name\n response format: {name: xxxxx}"},
          {role: "assistant", content: `{name: "my name is chatgpt an AI model created by OpenAI"}`},
          {role: "user", content: q},
        ]
        
    };
    // console.log(input_message.messages[1].content);
   return input_message
}


function NewBulletsIdeas(bullets, brand, keywords) {
     const input_message = {
        messages: [
          {role: "system", content: "You are amazon seller"},
          {role: "user", content: ` I am selling a same product on amazon.\n
                                    Rewrite this bullet list, remove the replace keywords and brand name with mine:\n
                                    Original Text:\n
                                    ${bullets}
                                    
                                    brand name:\n
                                    ${brand}
                                    keywords:\n 
                                    ${keywords}
          `
          }
        ]
        
    };
    console.log(input_message.messages[1].content);
   return input_message
}


export default {
    WhatIsTheProduct, CreateBadSummaryCategories, ReviewAnalysis, CreateGoodSummaryCategories, AlwaysReturnJson, NewBulletsIdeas
}