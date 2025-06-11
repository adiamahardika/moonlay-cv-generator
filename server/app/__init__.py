from flask import Flask
from flask_cors import CORS
import os

# Import semua blueprint
from .record_blueprint import record_blueprint
from .bot_blueprint import bot_blueprint
from .cv_blueprint import cv_blueprint
from .cv_generate_blueprint import cv_generate_blueprint  # 🆕 Blueprint baru
from .polling_blueprint import start_polling
from .stats_blueprint import stats_blueprint

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
    app.register_blueprint(cv_blueprint)
    app.register_blueprint(cv_generate_blueprint)  # 🆕 Ini yang baru ditambahkan
    app.register_blueprint(stats_blueprint)

    # Jalankan polling bot di background thread
    start_polling()

    return app
