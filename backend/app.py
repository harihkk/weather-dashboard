# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.weather_routes import weather_bp
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

os.makedirs('logs', exist_ok=True)

app.register_blueprint(weather_bp)

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)
