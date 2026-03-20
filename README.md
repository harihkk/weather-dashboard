# Nimbus — Weather Dashboard

A real-time weather dashboard built with React and Flask. Search any city, use your current location, and get current conditions alongside a 5-day forecast — all wrapped in a responsive, weather-adaptive UI.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.1-green?logo=flask)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

- **City search** with recent search history (persisted in localStorage)
- **Browser geolocation** — one click to get weather at your current position
- **Current conditions** — temperature, feels-like, humidity, wind, pressure, visibility
- **5-day forecast** with daily highs, lows, and weather icons
- **Sunrise & sunset** times for the selected location
- **°C / °F toggle** — switch units on the fly
- **Dynamic backgrounds** — the UI adapts its color scheme based on weather conditions (clear, cloudy, rain, snow, night, etc.)
- **Responsive design** — works on desktop, tablet, and mobile

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | React 19, Axios                    |
| Backend  | Python 3, Flask, Flask-CORS        |
| API      | OpenWeatherMap (v2.5)              |
| Styling  | Custom CSS with glassmorphism      |

## Project Structure

```
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── config.py              # Environment and API configuration
│   ├── requirements.txt       # Python dependencies
│   ├── routes/
│   │   └── weather_routes.py  # /weather, /forecast, /geocode endpoints
│   └── utils/
│       └── api_client.py      # OpenWeatherMap API client
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js             # Main application component
│       ├── App.css            # All styles
│       └── components/
│           ├── SearchBar.js       # City search with recent history
│           ├── CurrentWeather.js  # Current conditions display
│           ├── WeatherDetails.js  # Detail cards grid
│           └── Forecast.js        # 5-day forecast row
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- An [OpenWeatherMap API key](https://openweathermap.org/api) (free tier works)

### Setup

**1. Clone the repo**

```bash
git clone https://github.com/harihkk/weather-dashboard.git
cd weather-dashboard
```

**2. Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
API_KEY=your_openweathermap_api_key
```

Start the server:

```bash
python app.py
```

The API runs on `http://localhost:5000`.

**3. Frontend**

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint    | Params            | Description              |
|--------|-------------|-------------------|--------------------------|
| GET    | `/weather`  | `lat`, `lon`      | Current weather data     |
| GET    | `/forecast` | `lat`, `lon`      | 5-day / 3-hour forecast  |
| GET    | `/geocode`  | `city`            | City name to coordinates |

## License

MIT
