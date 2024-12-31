# app/__init__.py

from flask import Flask
from .record_blueprint import record_blueprint
from .bot_blueprint import bot_blueprint
from .cv_blueprint import cv_blueprint
from .polling_blueprint import start_polling
from flask_cors import CORS
import os


def create_app():
    static_folder_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static')

  # Set the static folder path
    app = Flask(__name__, static_folder=static_folder_path)

    CORS(app)  # Enable CORS for all routes

    # Register blueprints
    app.register_blueprint(record_blueprint)
    app.register_blueprint(bot_blueprint)
    app.register_blueprint(cv_blueprint)

    # Additional configuration can go here
    start_polling()  # This will initiate polling in a separate thread
    return app
