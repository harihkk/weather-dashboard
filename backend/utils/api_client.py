# backend/utils/api_client.py
import requests
import logging
from config import Config

logging.basicConfig(filename=Config.LOG_FILE, level=logging.INFO)


def fetch_weather_data(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={Config.API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        logging.info(f"Weather fetch for lat={lat}, lon={lon}: status {response.status_code}")
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching weather data: {e}")
        return None


def fetch_forecast_data(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={Config.API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        logging.info(f"Forecast fetch for lat={lat}, lon={lon}: status {response.status_code}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching forecast data: {e}")
        return None


def geocode_city(city):
    url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={Config.API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return {'lat': data[0]['lat'], 'lon': data[0]['lon'], 'name': data[0].get('name'), 'country': data[0].get('country')}
        return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error geocoding city: {e}")
        return None
