from flask import Flask
from .record_blueprint import record_blueprint
from .bot_blueprint import bot_blueprint
from .cv_blueprint import cv_blueprint
from .polling_blueprint import start_polling
from flask_cors import CORS
from app.stats_blueprint import stats_blueprint
import os

def create_app():
    # Set folder static agar bisa akses file hasil upload
    static_folder_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static')
    app = Flask(__name__, static_folder=static_folder_path)

    CORS(app)  # Aktifkan CORS

    # Route root test
    @app.route("/")
    def index():
        return "✅ Backend is running and accessible on local network!"

    # Registrasi semua blueprint
    app.register_blueprint(record_blueprint)
    app.register_blueprint(bot_blueprint)
    app.register_blueprint(cv_blueprint)  # ✅ Tanpa url_prefix '/api'
    app.register_blueprint(stats_blueprint)

    # Jalankan polling bot di background thread
    start_polling()

    return app
