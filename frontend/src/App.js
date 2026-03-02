// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import Map from './components/Map';
import WeatherCard from './components/WeatherCard';

const API_URL = 'http://127.0.0.1:5000/weather';

function App() {
    const [coordinates, setCoordinates] = useState(null);
    const [weather, setWeather] = useState(null);

    const fetchWeather = async () => {
        if (!coordinates) return;

        try {
            const response = await axios.get(`${API_URL}?lat=${coordinates.lat}&lon=${coordinates.lon}`);
            setWeather(response.data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Weather Dashboard</h1>
            <Map setCoordinates={setCoordinates} />
            <button onClick={fetchWeather} style={{ marginTop: '10px' }}>Get Weather</button>

            {weather && <WeatherCard weather={weather} />}
        </div>
    );
}

export default App;