# backend/config.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    API_KEY = os.getenv('API_KEY')
    BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
    DEBUG = True
    LOG_FILE = 'logs/app.log'