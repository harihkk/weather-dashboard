# backend/utils/api_client.py
import requests
import logging
from config import Config

# Configure logging
logging.basicConfig(filename=Config.LOG_FILE, level=logging.INFO)

def fetch_weather_data(lat, lon):
    """
    Fetch weather data from OpenWeatherMap API.
    """
    url = f"{Config.BASE_URL}?lat={lat}&lon={lon}&exclude=hourly,daily&appid={Config.API_KEY}&units=metric"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        logging.info(f"Successfully fetched weather data for lat={lat}, lon={lon}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching weather data: {e}")
        return None