from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import subprocess
import os
import threading
import socketio as socketio_client  # <-- Rename client import


base_dir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, static_folder=os.path.join(base_dir, 'static'), template_folder=os.path.join(base_dir, 'templates'))
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    """Serve the main application."""
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute():
    """Execute system command."""
    try:
        data = request.get_json()
        if not data or 'command' not in data:
            return jsonify({'message': 'No command provided'}), 400

        command = data['command']

        # Execute the command
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=30
        )

        if result.returncode != 0:
            return jsonify({
                'stdout': result.stdout.strip(),
                'stderr': result.stderr.strip(),
                'status': 'error'
            }), 500

        return jsonify({
            'stdout': result.stdout.strip(),
            'stderr': result.stderr.strip(),
            'status': 'success'
        }), 200

    except subprocess.TimeoutExpired:
        return jsonify({'message': 'Command execution timed out'}), 408
    except Exception as e:
        print("Command error:", e)  # <-- Debugging ke liye add kar sakte hain
        app.logger.error(f"Error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# --- SocketIO events ---
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('server_response', {'message': 'Connected to Odio WebSocket server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# External Socket.IO client code
def start_external_socketio_client():
    sio = socketio_client.Client()  # <-- Use renamed import

    @sio.event
    def connect():
        print("Connected to external server")

    @sio.event
    def disconnect():
        print("Disconnected from external server")

    @sio.on('your_event')  # Replace 'your_event' with the event you want to listen for
    def on_data(data):
        print("Received data from external server:", data)
        # You can emit this data to your own clients if needed
        # socketio.emit('external_data', data)

    try:
        # Replace 'http://external-server:port' with your target server URL
        sio.connect('http://localhost:5001')
        sio.wait()
    except Exception as e:
        print("External SocketIO connection error:", e)

# Start the client in a background thread when the Flask app starts
def start_background_client():
    t = threading.Thread(target=start_external_socketio_client, daemon=True)
    t.start()

if __name__ == '__main__':
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    start_background_client()  # <-- Start the external Socket.IO client
    socketio.run(app, host='0.0.0.0', port=3380, debug=False)
