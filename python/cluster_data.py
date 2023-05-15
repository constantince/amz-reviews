__all__ = ['create_json']


import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
from IPython.display import display
from dotenv import load_dotenv
import openai, os
import time

# 加载.env文件
load_dotenv()

# AI 模型参数
COMPLETIONS_MODEL = "gpt-3.5-turbo"
# AI key
openai.api_key = os.environ.get("OPENAI_API_KEY")

def rewriteBullets(path):
    with open(path, 'r') as file:
        # 读取文件内容
        content = file.read()
    start = time.time()  # 记录开始时间
    print(content)
    response = openai.ChatCompletion.create(
        model=COMPLETIONS_MODEL,
        messages=[{"role": "user", "content": content}],
        temperature=1.0,
        top_p=1,
    )
    end = time.time()  # 记录结束时间
    print('执行时间：', end - start, '秒********************')
    strs = response["choices"][0]["message"]["content"].replace("\n", "")
    print(strs)
    return strs

def create_json(par_path_path):
    
    embedding_df = pd.read_parquet(par_path_path)
    # print(embedding_df)
    if(embedding_df.empty):
        return []
    
    matrix = np.vstack(embedding_df.embedding.values)
    # 分类别数量
    num_of_clusters = 10
    # 喂给AI得随机数据条数
    items_per_cluster = 20
    
    
    ##########################################
    
    # 设置 K 值的取值范围
    # k_range = range(1, 20)
     
    start = time.time()  # 记录开始时间
    # 计算每个 K 值下的 SSE
    sse = []
    for k in k_range:
        kmeans = KMeans(n_clusters=k, init="k-means++", n_init=10, random_state=42)
        kmeans.fit(matrix)
        sse.append(kmeans.inertia_)
    
    
    # 找到 SSE 急剧下降的拐点，即为最优的 K 值
    diffs = [sse[i]-sse[i-1] for i in range(1, len(sse))]
    num_of_clusters = diffs.index(max(diffs)) + 2
    print("The optimal K value is:", k_optimal)
    
    ##########################################
    end = time.time()  # 记录结束时间
    print('执行时间：', end - start, '秒********************')
    # return
    
    
    
    
    
    # 获取行数
    num_rows = embedding_df.shape[0]

   
    #使用kmeans算法对向量矩阵进行分类
    kmeans = KMeans(n_clusters=num_of_clusters, init="k-means++", n_init=10, random_state=42)
    kmeans.fit(matrix)
    labels = kmeans.labels_
    embedding_df["cluster"] = labels
    # print(embedding_df)
    # return
    # embedding_df.sort_values(by='cluster', ascending=False)
    # embedding_df = embedding_df.head(5)
   
    # print(embedding_df)
    # return
    # return
    # print(embedding_df)
    # print(embedding_df["cluster"].values)
    # 统计每个cluster的数量
    new_df = embedding_df.groupby('cluster')['cluster'].count().reset_index(name='count')
    # new_df = new_df.sort_values(by='count', ascending=False)
    # new_df = new_df.head(5)
    # print(new_df.values)
    # return
    # 创建数据字典，用来返回给前端展示
    dic = []
    lines =  embedding_df["line"].values
    for item in new_df.values:
        count = item[1]
        cluster = item[0]
        p = count / num_rows * 100
        p = "{:.2%}".format(p/100)
        dic.append({"count": str(count), "line": [], "present": p, "cluster": str(cluster)})
    
    for index, item in enumerate(embedding_df["cluster"].values):
        dic[item]["line"].append(str(lines[index]))
    
    dic = sorted_data = sorted(dic, key=lambda x: int(x['count']), reverse=True)[:5]
    # print(dic)
    # return;
    # print(new_df.values)
    # print(embedding_df["content"].values)
    # 统计这个cluster里最多的分类的数量
    # title_count = embedding_df.groupby(['cluster', 'title']).size().reset_index(name='title_count')
    # first_titles = title_count.groupby('cluster').apply(lambda x: x.nlargest(1, columns=['title_count']))
    # first_titles = first_titles.reset_index(drop=True)
    # new_df = pd.merge(new_df, first_titles[['cluster', 'title', 'title_count']], on='cluster', how='left')
    # new_df = new_df.rename(columns={'title': 'rank1', 'title_count': 'rank1_count'})
    
    # 统计这个cluster里第二多的分类的数量
    # second_titles = title_count[~title_count['title'].isin(first_titles['title'])]
    # second_titles = second_titles.groupby('cluster').apply(lambda x: x.nlargest(1, columns=['title_count']))
    # second_titles = second_titles.reset_index(drop=True)
    # new_df = pd.merge(new_df, second_titles[['cluster', 'title', 'title_count']], on='cluster', how='left')
    # new_df = new_df.rename(columns={'title': 'rank2', 'title_count': 'rank2_count'})
    # new_df['first_percentage'] = (new_df['rank1_count'] / new_df['count']).map(lambda x: '{:.2%}'.format(x))
    # 将缺失值替换为 0
    # new_df.fillna(0, inplace=True)
    # 输出结果
    # display(new_df)
    
    
    # 开始利用gpt对随机样本进行总结
    for index, item in enumerate(dic):
        # cluster_name = new_df[new_df.cluster == i].iloc[0].rank1
        # print(f"Cluster {i}, Rank 1: {cluster_name}, Theme:", end=" ")
      
        cluster = int(item["cluster"])
        # 选取样本
        content = "\n".join(
            embedding_df[embedding_df.cluster ==cluster].title.sample(items_per_cluster, random_state=5, replace=True).values
        )
        print(f'''Here are some negative reviews from Amazon users regarding a product, which all describe a common topic. Summarize in 10 words or less what the topic is.\n\nContent:\n\n{content}\n\n.''')
        # 调用接口
        start = time.time()  # 记录开始时间
        response = openai.ChatCompletion.create(
            model=COMPLETIONS_MODEL,
            messages=[{"role": "user", "content": f'''Here are some negative reviews from Amazon users regarding a product, which all describe a common topic. Summarize in 10 words or less what the topic is.\n\nContent:\n\n{content}\n\n.'''}],
            temperature=1.0,
            max_tokens=30,
            top_p=1,
        )
        
        end = time.time()  # 记录结束时间
        print('执行时间：', end - start, '秒********************')
        # print(response["choices"][0]["message"]["content"].replace("\n", ""))
        item["content"] = response["choices"][0]["message"]["content"].replace("\n", "")
    # print(dic)
    
    return dic
    
if __name__ == '__main__':
    create_json("data/66926470-9357-4e9e-97af-7b507fe259d6.parquet")
    
