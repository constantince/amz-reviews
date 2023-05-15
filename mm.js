// const openai = require("openai");
import { Configuration, OpenAIApi } from "openai";


// openai.apiKey = "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";

const configuration = new Configuration({
  apiKey:  "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",
});

const openai = new OpenAIApi(configuration);

async function queryGPT3() {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: "Hi"}],
      max_tokens: 100, // 可自定义输出长度
      temperature: 0.5,
    });

    return completion.data.choices.content
  } catch (error) {
    console.error(error);
  }
}

// 调用函数
queryGPT3().then((result) => {
  console.log(result);
});
