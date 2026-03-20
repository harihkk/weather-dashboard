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

    weather_data = fetch_weather_data(lat, lon)
    if weather_data and weather_data.get('cod') != 200:
        return jsonify({'error': weather_data.get('message', 'API error')}), weather_data.get('cod', 500)
    if not weather_data:
        return jsonify({'error': 'Failed to fetch weather data'}), 500

    return jsonify(weather_data)


@weather_bp.route('/forecast', methods=['GET'])
def get_forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    forecast_data = fetch_forecast_data(lat, lon)
    if not forecast_data:
        return jsonify({'error': 'Failed to fetch forecast data'}), 500

    return jsonify(forecast_data)


@weather_bp.route('/geocode', methods=['GET'])
def geocode():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    result = geocode_city(city)
    if not result:
        return jsonify({'error': 'City not found'}), 404

    return jsonify(result)
