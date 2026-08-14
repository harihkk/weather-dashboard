# backend/routes/weather_routes.py
from flask import Blueprint, request, jsonify
from utils.api_client import fetch_weather_data, fetch_forecast_data, geocode_city

weather_bp = Blueprint('weather', __name__)


@weather_bp.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    # Validate coordinate ranges
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        if not (-90 <= lat_float <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        if not (-180 <= lon_float <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid latitude or longitude format'}), 400

    weather_data = fetch_weather_data(lat_float, lon_float)
    
    if weather_data is None:
        return jsonify({'error': 'Failed to fetch weather data'}), 500
    
    if isinstance(weather_data.get('cod'), int) and weather_data['cod'] != 200:
        error_msg = weather_data.get('message', 'API error')
        status_code = 400 if weather_data['cod'] == 404 else 500
        return jsonify({'error': error_msg}), status_code
    
    return jsonify(weather_data)


@weather_bp.route('/forecast', methods=['GET'])
def get_forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    # Validate coordinate ranges
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        if not (-90 <= lat_float <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        if not (-180 <= lon_float <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid latitude or longitude format'}), 400

    forecast_data = fetch_forecast_data(lat_float, lon_float)
    
    if forecast_data is None:
        return jsonify({'error': 'Failed to fetch forecast data'}), 500
    
    if isinstance(forecast_data.get('cod'), int) and forecast_data['cod'] != 200:
        error_msg = forecast_data.get('message', 'API error')
        return jsonify({'error': error_msg}), 400
    
    return jsonify(forecast_data)


@weather_bp.route('/geocode', methods=['GET'])
def geocode():
    city = request.args.get('city')
    if not city or not isinstance(city, str) or not city.strip():
        return jsonify({'error': 'City parameter is required and must be a non-empty string'}), 400

    result = geocode_city(city.strip())
    if not result:
        return jsonify({'error': 'City not found'}), 404

    return jsonify(result)


@weather_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({'status': 'healthy', 'service': 'nimbus-weather-api'})
