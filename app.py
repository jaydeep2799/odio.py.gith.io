from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import subprocess
import os


base_dir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, static_folder=os.path.join(base_dir, 'static'), template_folder=os.path.join(base_dir, 'templates'))
# app = Flask(__name__)
CORS(app)

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
        app.logger.error(f"Error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    app.run(host='0.0.0.0', port=3380, debug=False)

