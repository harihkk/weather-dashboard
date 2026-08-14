# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.weather_routes import weather_bp
from config import Config
import os
import sys

def create_app():
    """Application factory for creating Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Validate configuration before starting
    try:
        Config.validate()
    except ValueError as e:
        print(f"Configuration Error: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Configure CORS with allowed origins from environment
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    
    # Ensure logs directory exists before any logging occurs
    os.makedirs('logs', exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(weather_bp, url_prefix='/api')
    
    # Add health check at root level too
    @app.route('/health')
    def health():
        from flask import jsonify
        return jsonify({'status': 'healthy', 'service': 'nimbus-weather-api'})
    
    return app


app = create_app()

if __name__ == '__main__':
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
