# backend/routes/weather_routes.py
from flask import Blueprint, request, jsonify
from utils.api_client import fetch_weather_data

# Create a Blueprint for weather routes
weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather', methods=['GET'])
def get_weather():
    """
    Endpoint to fetch weather data based on latitude and longitude.
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    # Validate input
    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    # Fetch weather data
    weather_data = fetch_weather_data(lat, lon)
    if not weather_data:
        return jsonify({'error': 'Failed to fetch weather data'}), 500

    return jsonify(weather_data)