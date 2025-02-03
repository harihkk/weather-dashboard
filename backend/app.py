from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
<<<<<<< HEAD
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Adjust frontend origin

API_KEY = os.getenv("API_KEY")  # Load API key from .env
if not API_KEY:
    raise ValueError("API_KEY is missing. Make sure to set it in the .env file.")

BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'  # Use v2.5 for free-tier
=======
CORS(app)
API_KEY = os.getenv("API_KEY")  # Load API key from .env
BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall'
>>>>>>> 011de7f (first-commit)

@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
<<<<<<< HEAD
    
=======
>>>>>>> 011de7f (first-commit)
    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    # Construct the API URL
<<<<<<< HEAD
    url = f"{BASE_URL}?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"

    try:
=======
    url = f"{BASE_URL}?lat={lat}&lon={lon}&exclude=hourly,daily&appid={API_KEY}&units=metric"

    try:
        # Make the API call
>>>>>>> 011de7f (first-commit)
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch weather data'}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
<<<<<<< HEAD
    app.run(port=5001, debug=True)  # Change port if needed
=======
    app.run()
>>>>>>> 011de7f (first-commit)
