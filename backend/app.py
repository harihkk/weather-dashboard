# backend/app.py
from flask import Flask
from routes.weather_routes import weather_bp
from config import Config

# Initialize the Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Register the weather blueprint
app.register_blueprint(weather_bp)

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)