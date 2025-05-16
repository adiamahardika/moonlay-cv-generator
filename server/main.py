# main.py
import os
from dotenv import load_dotenv
from app import create_app
from flask_cors import CORS

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=dotenv_path)  # Load environment variables
print(os.getenv('FLASK_HOST'))
host = os.getenv('FLASK_HOST', '192.168.111.131')
port = int(os.getenv('FLASK_PORT', 5000))  # Default to 5000 if not set
debug = os.getenv('FLASK_DEBUG', 'False').lower() in [
    'true', '1', 't']  # Convert to boolean

app = create_app()

CORS(app)

if __name__ == "__main__":
    app.run(host=host, port=port, debug=debug)
