
__all__ = ['hanldeExcelData']

from openai.embeddings_utils import get_embeddings
import openai, os, tiktoken, backoff
import pandas as pd
import uuid
# from query import df
from dotenv import load_dotenv

# 加载.env文件
load_dotenv()

# -------------------------------- read csv and count toke for open ai limitations.

# print(openai.api_key)
# AI key
openai.api_key = os.environ.get("OPENAI_API_KEY")
embedding_model = "text-embedding-ada-002"
embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
batch_size = 10
max_tokens = 8000  # the maximum for text-embedding-ada-002 is 8191


def handleBullets(df, new_file_name):
    print(df.products.values)
    product_name = df.products.values[0]
    brand_name = df.brand.values[0]
    kw = df.kw.values[0]
    content = "\n".join(df.list.values)
    
    prompt = f'''
        Rewrite the below list of Amazon bullet points but add in the list of keywords below.\n
        Bullet points: {content}\n
        Keywords: {kw}\n
        
        Keep the original meaning of the existing bullet points, and make sure that the bullet point writing still flows nicely. \n
        Here are some informations may provide help:\n
        Product name: {product_name}\n
        Brand name: {brand_name}\n
    '''
    
    new_file_name = f"txt/{new_file_name}.txt"
    
    try:
        # 打开文件（如果文件不存在则会创建）
        file = open(new_file_name, "w")
        
        # 写入内容到文件中
        file.write(prompt)

    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        # 关闭文件
        file.close()

    return new_file_name


def handleReviews(df, new_file_name):
     # print("Number of rows before null filtering:", len(df))
    # 过滤掉3星以上的评价，1 2星的默认都是差评
    df = df[df['star'] <= 3]
    # print(df)
    encoding = tiktoken.get_encoding(embedding_encoding)
    # print("Number of rows before null filtering:", len(df))
    df["n_tokens"] = df.content.apply(lambda x: len(encoding.encode(x)))
    # print("Number of rows before token number filtering:", len(df))
    # 超过token限制的评论过滤
    df = df[df.n_tokens <= max_tokens]
    
    # 保留行号
    # 使用insert()方法添加新的行号列
    # 将行号作为新的一列并命名为 'line'
    df.reset_index(inplace=True)
    df.rename(columns={'index': 'line'}, inplace=True)
    df['line'] = df['line'].apply(lambda x: x + 2)
    print("Number of rows data used:", len(df))
    # print(df)
    # ---------------------------------- generate parquet sets from cvs and begin to embdding
    # openai 有限制措施，采用backoff函数控制接口调用和token的使用上线
    @backoff.on_exception(backoff.expo, openai.error.RateLimitError)
    def get_embeddings_with_backoff(prompts, engine):
        embeddings = []
        for i in range(0, len(prompts), batch_size):
            batch = prompts[i:i+batch_size]
            embeddings += get_embeddings(list_of_text=batch, engine=engine)
        return embeddings
    
    prompts = df.content.tolist()
    prompt_batches = [prompts[i:i+batch_size] for i in range(0, len(prompts), batch_size)]
    
    # 开始请求openai 的接口，把content矢量化
    embeddings = []
    for batch in prompt_batches:
        batch_embeddings = get_embeddings_with_backoff(prompts=batch, engine=embedding_model)
        embeddings += batch_embeddings
    
    df["embedding"] = embeddings
    new_file_name = f"data/{new_file_name}.parquet"
    df.to_parquet(new_file_name, index=False)
    return new_file_name


def hanldeExcelData(path):
    df_params = pd.read_excel(path, sheet_name="params");
    reviews = df_params.rating.values[0]
    bullets = df_params.bullets.values[0]
    
    # questions = df_params.questions.values[0]
    path_dic = {}
    random_name = uuid.uuid4()
     # 评论内容
    if(reviews):
        reviews_file_path = handleReviews(pd.read_excel(path, sheet_name="reviews"), random_name)
        path_dic["reviews_file_path"] = reviews_file_path
     # 描述列表
    if(bullets):
        bullets_file_path = handleBullets(pd.read_excel(path, sheet_name="bullets"), random_name)
        path_dic["bullets_file_path"] = bullets_file_path
        
    print(path_dic)
    return path_dic
   
    
    

if __name__ == '__main__':
    hanldeExcelData("excels/bad_reivews.xlsx")