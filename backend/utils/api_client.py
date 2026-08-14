# backend/utils/api_client.py
import os
import requests
import logging
import time
from config import Config

# Simple in-memory cache with TTL
class SimpleCache:
    def __init__(self, ttl=300):
        self._cache = {}
        self._timestamps = {}
        self.ttl = ttl
    
    def get(self, key):
        """Get cached value if not expired."""
        if key in self._cache:
            if time.time() - self._timestamps[key] < self.ttl:
                return self._cache[key]
            else:
                # Expired, remove it
                del self._cache[key]
                del self._timestamps[key]
        return None
    
    def set(self, key, value):
        """Set cached value with timestamp."""
        self._cache[key] = value
        self._timestamps[key] = time.time()
    
    def clear(self):
        """Clear all cached data."""
        self._cache.clear()
        self._timestamps.clear()

# Initialize caches for different endpoints
weather_cache = SimpleCache(ttl=Config.CACHE_TTL)
forecast_cache = SimpleCache(ttl=Config.CACHE_TTL)
geocode_cache = SimpleCache(ttl=Config.CACHE_TTL * 2)  # Geocoding changes less frequently

# Configure logging after ensuring logs directory exists
def setup_logging():
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    logging.basicConfig(
        filename=Config.LOG_FILE,
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

logger = setup_logging()


def _validate_coordinates(lat, lon):
    """Validate latitude and longitude ranges."""
    try:
        lat = float(lat)
        lon = float(lon)
        if not (-90 <= lat <= 90):
            raise ValueError(f"Latitude must be between -90 and 90, got {lat}")
        if not (-180 <= lon <= 180):
            raise ValueError(f"Longitude must be between -180 and 180, got {lon}")
        return True
    except (TypeError, ValueError) as e:
        logger.error(f"Invalid coordinates: lat={lat}, lon={lon}, error={e}")
        return False


def fetch_weather_data(lat, lon):
    """Fetch current weather data with caching."""
    if not _validate_coordinates(lat, lon):
        return None
    
    cache_key = f"{lat}_{lon}"
    cached = weather_cache.get(cache_key)
    if cached is not None:
        logger.info(f"Weather cache hit for lat={lat}, lon={lon}")
        return cached
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'lat': lat,
        'lon': lon,
        'appid': Config.API_KEY,
        'units': 'metric'
    }
    
    try:
        response = requests.get(url, params=params, timeout=Config.REQUEST_TIMEOUT)
        
        # Handle non-200 responses
        if response.status_code != 200:
            logger.warning(f"Weather API returned status {response.status_code} for lat={lat}, lon={lon}")
            try:
                error_data = response.json()
                logger.warning(f"Weather API error: {error_data}")
            except:
                pass
            return {'cod': response.status_code, 'message': f'API error: {response.status_code}'}
        
        data = response.json()
        
        # Validate response structure
        if not isinstance(data, dict) or 'cod' not in data:
            logger.error(f"Malformed weather response for lat={lat}, lon={lon}")
            return None
        
        weather_cache.set(cache_key, data)
        logger.info(f"Weather fetch for lat={lat}, lon={lon}: status {response.status_code}")
        return data
        
    except requests.exceptions.Timeout:
        logger.error(f"Weather request timeout for lat={lat}, lon={lon}")
        return {'cod': 408, 'message': 'Request timeout'}
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching weather data: {e}")
        return None


def fetch_forecast_data(lat, lon):
    """Fetch forecast data with caching."""
    if not _validate_coordinates(lat, lon):
        return None
    
    cache_key = f"{lat}_{lon}"
    cached = forecast_cache.get(cache_key)
    if cached is not None:
        logger.info(f"Forecast cache hit for lat={lat}, lon={lon}")
        return cached
    
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        'lat': lat,
        'lon': lon,
        'appid': Config.API_KEY,
        'units': 'metric'
    }
    
    try:
        response = requests.get(url, params=params, timeout=Config.REQUEST_TIMEOUT)
        
        # Handle non-200 responses
        if response.status_code != 200:
            logger.warning(f"Forecast API returned status {response.status_code} for lat={lat}, lon={lon}")
            return {'cod': response.status_code, 'message': f'API error: {response.status_code}'}
        
        data = response.json()
        
        # Validate response structure
        if not isinstance(data, dict) or 'cod' not in data or data['cod'] != 200:
            logger.error(f"Invalid forecast response for lat={lat}, lon={lon}")
            return None
        
        forecast_cache.set(cache_key, data)
        logger.info(f"Forecast fetch for lat={lat}, lon={lon}: status {response.status_code}")
        return data
        
    except requests.exceptions.Timeout:
        logger.error(f"Forecast request timeout for lat={lat}, lon={lon}")
        return {'cod': 408, 'message': 'Request timeout'}
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching forecast data: {e}")
        return None


def geocode_city(city):
    """Geocode city name with caching."""
    if not city or not isinstance(city, str):
        logger.error(f"Invalid city parameter: {city}")
        return None
    
    city_normalized = city.strip().lower()
    cache_key = city_normalized
    
    cached = geocode_cache.get(cache_key)
    if cached is not None:
        logger.info(f"Geocode cache hit for city={city}")
        return cached
    
    url = "https://api.openweathermap.org/geo/1.0/direct"
    params = {
        'q': city,
        'limit': 5,  # Get multiple results for better selection
        'appid': Config.API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=Config.REQUEST_TIMEOUT)
        
        if response.status_code != 200:
            logger.warning(f"Geocode API returned status {response.status_code} for city={city}")
            return None
        
        data = response.json()
        
        if not isinstance(data, list) or len(data) == 0:
            logger.info(f"City not found: {city}")
            return None
        
        # Return the first result with country info preferred
        best_result = None
        for result in data:
            if result.get('country'):
                best_result = result
                break
        
        if not best_result:
            best_result = data[0]
        
        result = {
            'lat': best_result['lat'],
            'lon': best_result['lon'],
            'name': best_result.get('name', city),
            'country': best_result.get('country'),
            'state': best_result.get('state')
        }
        
        geocode_cache.set(cache_key, result)
        logger.info(f"Geocoded city={city} to lat={result['lat']}, lon={result['lon']}")
        return result
        
    except requests.exceptions.Timeout:
        logger.error(f"Geocode request timeout for city={city}")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error geocoding city: {e}")
        return None
