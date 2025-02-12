from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
import os

# Load environment variables
load_dotenv()

# Initialize the Flask app


def create_app():
    app = Flask(__name__, static_folder='static')
    CORS(app)

    # Register the quotation blueprint from the correct path
    from app.routes.quotation_routes import quotation_bp
    app.register_blueprint(quotation_bp)

    return app
