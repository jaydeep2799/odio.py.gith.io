import socketio
from flask import Flask

sio = socketio.Server(cors_allowed_origins="*")
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

@sio.event
def connect(sid, environ):
    print('Client connected:', sid)
    sio.emit('your_event', {'msg': 'Hello from external server!'})

@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
