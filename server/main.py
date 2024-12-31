# main.py
import os
from dotenv import load_dotenv
from app import create_app


load_dotenv(dotenv_path='../.env')

host = os.getenv('FLASK_HOST', '127.0.0.1')
port = int(os.getenv('FLASK_PORT', 5000))  # Default to 5000 if not set
debug = os.getenv('FLASK_DEBUG', 'False').lower() in [
    'true', '1', 't']  # Convert to boolean

app = create_app()

if __name__ == "__main__":
    app.run(host=host, port=port, debug=debug)
