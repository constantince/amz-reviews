from flask import Flask, jsonify, request
from flask_cors import CORS
from create_local_parquet import hanldeExcelData
from cluster_data import create_json, rewriteBullets
from summary import summary
import os

app = Flask(__name__)
CORS(app)
# 接收excel文件
@app.route('/amz/api/receive-excel', methods=['POST'])
def receive_excel():
    file = request.files.get('file')
    if file:
        # 处理Excel文件
        filename = file.filename
        file.save(os.path.join('excels', filename))
        path = os.path.join('excels', filename)
        # 生产向量文件
        btns = hanldeExcelData(path)
        return jsonify({'result': 'success', 'btns': btns, 'message': 'ok'})
    else:
        return jsonify({'result': 'failed', 'message': 'no file uploaded'})
       

# 开始差评分析
@app.route('/amz/api/bad-review-analysis', methods=['POST'])
def bad_review_analysis():
    path =  request.json['path']
    print(path)
    json = create_json(path);
    print(json)
    return jsonify({'result': 'success', 'message': 'ok', 'data': json})
    

# 重写产品描述
@app.route('/amz/api/rewrite-bullets-list', methods=['POST'])
def rewrite_bullets_list():
    path =  request.json['path']
    print(path)
    bullets = rewriteBullets(path);
    # print(json)
    return jsonify({'result': 'success', 'message': 'ok', 'data': bullets})
    
# 总结差评
@app.route('/amz/api/short-summary', methods=['POST'])
def short_summary():
    data = request.json
    json = data['data']
    summaried_text = summary(json)
    if( summaried_text == False ) : 
        return jsonify({'result': 'success', 'message': 'ok', 'summary': []})
    else:
        return jsonify({'result': 'success', 'message': 'ok', 'summary': summaried_text})
    # print(j)
   

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8088)
