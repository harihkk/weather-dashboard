import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherDetails from './components/WeatherDetails';
import './App.css';

const API = 'http://127.0.0.1:5000';

function App() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [unit, setUnit] = useState('C');
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });

    const fetchWeatherByCoords = useCallback(async (lat, lon, name) => {
        setLoading(true);
        setError(null);

        try {
            const [weatherRes, forecastRes] = await Promise.all([
                axios.get(`${API}/weather?lat=${lat}&lon=${lon}`),
                axios.get(`${API}/forecast?lat=${lat}&lon=${lon}`)
            ]);

            setWeather(weatherRes.data);
            setForecast(forecastRes.data);
            setLocationName(name || weatherRes.data.name || 'Unknown');
            setLastUpdated(new Date());
        } catch (err) {
            const msg = err.response?.data?.error || 'Could not fetch weather data. Check your connection.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = async (query) => {
        setLoading(true);
        setError(null);

        try {
            const geoRes = await axios.get(`${API}/geocode?city=${encodeURIComponent(query)}`);
            const { lat, lon, name, country } = geoRes.data;
            const fullName = `${name}, ${country}`;

            setRecentSearches(prev => {
                const updated = [fullName, ...prev.filter(s => s !== fullName)].slice(0, 5);
                localStorage.setItem('recentSearches', JSON.stringify(updated));
                return updated;
            });

            await fetchWeatherByCoords(lat, lon, fullName);
        } catch (err) {
            setError('City not found. Try another search.');
            setLoading(false);
        }
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, 'Your Location');
            },
            () => {
                setError('Location access denied. Search for a city instead.');
                setLoading(false);
            }
        );
    };

    const toggleUnit = () => setUnit(u => u === 'C' ? 'F' : 'C');

    const convertTemp = (celsius) => {
        if (unit === 'F') return Math.round((celsius * 9 / 5) + 32);
        return Math.round(celsius);
    };

    const getBackgroundClass = () => {
        if (!weather?.weather?.[0]) return 'bg-default';
        const id = weather.weather[0].id;
        const icon = weather.weather[0].icon;
        const isNight = icon.includes('n');

        if (id >= 200 && id < 300) return 'bg-storm';
        if (id >= 300 && id < 600) return 'bg-rain';
        if (id >= 600 && id < 700) return 'bg-snow';
        if (id >= 700 && id < 800) return 'bg-mist';
        if (id === 800) return isNight ? 'bg-clear-night' : 'bg-clear';
        return isNight ? 'bg-clouds-night' : 'bg-clouds';
    };

    useEffect(() => {
        if (recentSearches.length > 0) {
            handleSearch(recentSearches[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`app ${getBackgroundClass()}`}>
            <div className="app-overlay">
                <header className="app-header">
                    <div className="logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        </svg>
                        <span>Nimbus</span>
                    </div>
                    <div className="header-actions">
                        <button className="unit-toggle" onClick={toggleUnit} title="Toggle temperature unit">
                            {unit === 'C' ? '°C' : '°F'}
                        </button>
                        <button className="geo-btn" onClick={handleGeolocation} title="Use my location">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                            </svg>
                        </button>
                    </div>
                </header>

                <SearchBar
                    onSearch={handleSearch}
                    recentSearches={recentSearches}
                    loading={loading}
                />

                {error && (
                    <div className="error-banner">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                        {error}
                    </div>
                )}

                {loading && !weather && (
                    <div className="loader-container">
                        <div className="loader"></div>
                        <p>Fetching weather data...</p>
                    </div>
                )}

                {weather && weather.cod === 200 && (
                    <main className="weather-content">
                        <CurrentWeather
                            weather={weather}
                            locationName={locationName}
                            convertTemp={convertTemp}
                            unit={unit}
                            lastUpdated={lastUpdated}
                        />
                        <WeatherDetails weather={weather} />
                        {forecast && <Forecast forecast={forecast} convertTemp={convertTemp} unit={unit} />}
                    </main>
                )}

                {!weather && !loading && !error && (
                    <div className="welcome">
                        <div className="welcome-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4"/>
                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                            </svg>
                        </div>
                        <h2>Welcome to Nimbus</h2>
                        <p>Search for a city or use your location to get started</p>
                    </div>
                )}

                <footer className="app-footer">
                    <span>Data from OpenWeatherMap</span>
                </footer>
            </div>
        </div>
    );
}

export default App;
