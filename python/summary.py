__all__ = ['summary']


import openai, os
from dotenv import load_dotenv
# 加载.env文件
load_dotenv()

# AI 模型参数
COMPLETIONS_MODEL = "gpt-3.5-turbo"
openai.api_key = os.environ.get("OPENAI_API_KEY")

d = [{"content":"Billing issues and hacked credit card information on PS services.","count":"1%","ids":["51"]},{"content":"PS5 disc reading issues, defective games, unresponsive customer support.","count":"16%","ids":["9","13","14","16","18","19","24","33","37","45","47","48","50","52","54","64"]},{"content":"PS5 has major issues with FPS, connectivity, and exclusive games.","count":"2%","ids":["39","58"]},{"content":"Damaged PS5 boxes and malfunctioning consoles.","count":"10%","ids":["1","3","5","8","12","17","22","25","29","31"]},{"content":"Common issue: Lack of backwards compatibility with physical game disks.","count":"12%","ids":["0","4","7","10","11","15","38","41","43","44","46","65"]},{"content":"PS5 has startup and disc reading issues.","count":"6%","ids":["21","23","30","32","35","49"]},{"content":"Common issues: Wi-Fi disconnects, overheating, controller drift, no remote.","count":"6%","ids":["6","20","27","34","42","53"]},{"content":"Issue: Difficulty obtaining an invitation to purchase the product.","count":"4%","ids":["56","57","61","62"]},{"content":"Disc version stops reading, go digital. Digital games more expensive.","count":"3%","ids":["2","36","40"]},{"content":"Product advertised as new but looks used.","count":"6%","ids":["26","28","55","59","60","63"]}]

prompts1 = "The following content are user's classification of negative reviews for a product. Each line represents a summary of a category of negative reviews. The number in front of the text indicates the number of comments, while the text afterwards summarizes the category. Based on this information, please write an analytical summary report for these review."

prompts2 = '''The following is a list of issues related to a product, each with its own description, and each list has a different proportion. Please write a summary based on these lists, with the following requirements:
1. Briefly summarize the content of these lists.
2. Prioritize the lists based on their percentage, i.e., a list that represents 16% of the total should appear earlier in the summary than one that represents 4%.
3. When summarizing a list, include the proportion it represents.'''

def make_str(data):
    
    result = ""
    for item in data:
        result +=  item["content"] + ' Percentage:' + item["percentage"] + ' \n'
    return result;

def summary(data):
    strs = make_str(data)
    print(f'''{prompts1}.\n\n\n{strs}''')
    response = openai.ChatCompletion.create(
            model=COMPLETIONS_MODEL,
            messages=[{"role": "user", "content": f'''{prompts2}.\n\n\n{strs}'''}],
            temperature=1.2,
            top_p=1,
        )
        
        
    message = response["choices"][0]["message"]["content"].replace("\n", "")
    # print(message)
    return message
    
if __name__ == '__main__':
    summary(d)