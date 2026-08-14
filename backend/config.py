# backend/config.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    API_KEY = os.getenv('API_KEY')
    BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
    DEBUG = os.getenv('FLASK_ENV', 'production') != 'production'
    LOG_FILE = 'logs/app.log'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 10))
    CACHE_TTL = int(os.getenv('CACHE_TTL', 300))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    @classmethod
    def validate(cls):
        """Validate required configuration."""
        if not cls.API_KEY:
            raise ValueError("API_KEY environment variable is required. Set it in .env file or export API_KEY=your_key")
        return True