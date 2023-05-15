# pip install flask-socketio
from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__, template_folder="templates")
socketio = SocketIO()
socketio.init_app(app, cors_allowed_origins='*')

name_space = '/dcenter'  # socketio 的命名空间

@app.route('/')
def index():
    return render_template("t1.html")

# 注册一个 my_event事件，响应前端发来的 my_event 事件的信息
@socketio.on('my_event', namespace=name_space)
def mtest_message(data):
    # print(data)
    # 发送一个 事件名称是 dcenter1 的信息给前端
    event_name = 'process'
    broadcasted_data = {"type": "delete", "user_id": "123", "data": "1111111111111"}
    socketio.emit(event_name, broadcasted_data, namespace=name_space)

# 下面注册 连接/断开/消息 三个默认事件
@socketio.on('connect', namespace=name_space)
def connected_msg():
    print('client connected.')

@socketio.on('disconnect', namespace=name_space)
def disconnect_msg():
    print('client disconnected.')

@socketio.on("message", namespace=name_space)
def message(data):
    print("message")

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=5000, debug=True)
    socketio.run(app, host='0.0.0.0', port=8088, debug=True)
