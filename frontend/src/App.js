import React, { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherDetails from './components/WeatherDetails';
import './App.css';

const API = 'http://127.0.0.1:5000';

// Premium spring animation timing functions - physically based with fine-tuned values
const springs = {
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  overshoot: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  premium: 'cubic-bezier(0.19, 1, 0.22, 1)'
};

// Memoized component wrappers for performance
const MemoizedCurrentWeather = memo(CurrentWeather);
const MemoizedForecast = memo(Forecast);
const MemoizedWeatherDetails = memo(WeatherDetails);

// Error boundary component for graceful error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>Please refresh the page to try again</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [unit, setUnit] = useState('C');
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem('nimbus_recent_searches');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [animateIn, setAnimateIn] = useState(false);
    const [entrancePhase, setEntrancePhase] = useState(0);
    const contentRef = useRef(null);
    const animationFrameRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Memoized temperature conversion
    const convertTemp = useCallback((celsius) => {
        if (typeof celsius !== 'number') return '--';
        return unit === 'F' ? Math.round((celsius * 9 / 5) + 32) : Math.round(celsius);
    }, [unit]);

    // Enhanced weather-based background with smooth transitions and precise weather code mapping
    const getBackgroundClass = useMemo(() => {
        if (!weather?.weather?.[0]) return 'bg-default';
        const id = weather.weather[0].id;
        const icon = weather.weather[0].icon;
        const isNight = icon.includes('n');

        // Precise OpenWeatherMap condition code mapping
        if (id >= 200 && id < 212) return 'bg-storm'; // Thunderstorm
        if (id >= 212 && id < 233) return 'bg-storm'; // Heavy thunderstorm
        if (id >= 300 && id < 500) return 'bg-rain'; // Drizzle
        if (id >= 500 && id < 504) return 'bg-rain'; // Light rain
        if (id >= 504 && id < 600) return 'bg-storm'; // Heavy rain
        if (id >= 600 && id < 612) return 'bg-snow'; // Snow
        if (id >= 612 && id < 700) return 'bg-snow'; // Heavy snow
        if (id >= 701 && id < 781) return 'bg-mist'; // Mist, fog, haze
        if (id === 800) return isNight ? 'bg-clear-night' : 'bg-clear'; // Clear sky
        if (id > 800 && id <= 804) return isNight ? 'bg-clouds-night' : 'bg-clouds'; // Cloudy
        return isNight ? 'bg-clouds-night' : 'bg-clouds';
    }, [weather]);

    // Track previous weather for smooth transitions - removed unused state
    useEffect(() => {
        // Cleanup function for animation frames and abort controllers
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchWeatherByCoords = useCallback(async (lat, lon, name) => {
        // Cancel any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);
        setAnimateIn(false);
        setEntrancePhase(0);

        try {
            const [weatherRes, forecastRes] = await Promise.all([
                axios.get(`${API}/weather?lat=${lat}&lon=${lon}`, { signal: abortControllerRef.current.signal }),
                axios.get(`${API}/forecast?lat=${lat}&lon=${lon}`, { signal: abortControllerRef.current.signal })
            ]);

            // Use requestAnimationFrame for smooth UI updates
            animationFrameRef.current = requestAnimationFrame(() => {
                setTimeout(() => {
                    setWeather(weatherRes.data);
                    setForecast(forecastRes.data);
                    setLocationName(name || weatherRes.data.name || 'Unknown');
                    setLastUpdated(new Date());
                    
                    // Staggered entrance animation sequence
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            setAnimateIn(true);
                            setEntrancePhase(1);
                        }, 80);
                    });
                }, 50);
            });
        } catch (err) {
            if (err.name === 'AbortError') return; // Ignore aborted requests
            
            const msg = err.response?.data?.error || 'Could not fetch weather data. Please check your connection.';
            setError(msg);
            setLoading(false);
        }
    }, []);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) return;
        
        setLoading(true);
        setError(null);
        setAnimateIn(false);
        setEntrancePhase(0);

        try {
            const geoRes = await axios.get(`${API}/geocode?city=${encodeURIComponent(query)}`);
            const { lat, lon, name, country } = geoRes.data;
            const displayName = country && country !== 'Unknown' ? `${name}, ${country}` : name;

            // Update recent searches with proper error handling
            setRecentSearches(prev => {
                const filtered = prev.filter(s => s !== displayName);
                const updated = [displayName, ...filtered].slice(0, 5);
                try {
                    localStorage.setItem('nimbus_recent_searches', JSON.stringify(updated));
                } catch {
                    // localStorage unavailable, continue without persisting
                }
                return updated;
            });

            await fetchWeatherByCoords(lat, lon, displayName);
        } catch (err) {
            setError('City not found. Please try another search.');
            setLoading(false);
        }
    }, [fetchWeatherByCoords]);

    const handleGeolocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser. Please search for a city instead.');
            return;
        }

        setLoading(true);
        setError(null);
        setAnimateIn(false);
        setEntrancePhase(0);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, 'Your Location');
            },
            (err) => {
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Location access denied. Please enable location permissions or search for a city.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location information unavailable. Please try again.');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out. Please check your connection and try again.');
                        break;
                    default:
                        setError('An error occurred while getting your location. Please search for a city.');
                }
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
        );
    }, [fetchWeatherByCoords]);

    const toggleUnit = useCallback(() => {
        setUnit(u => u === 'C' ? 'F' : 'C');
    }, []);

    // Load last searched location on mount with proper cleanup
    useEffect(() => {
        let isMounted = true;
        
        if (recentSearches.length > 0 && isMounted) {
            handleSearch(recentSearches[0]);
        }
        
        return () => {
            isMounted = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ErrorBoundary>
            <div className={`app ${getBackgroundClass}`} data-theme={getBackgroundClass}>
                {/* Multi-layer parallax animated backgrounds */}
                <div className="app-bg-layer layer-1" aria-hidden="true"></div>
                <div className="app-bg-layer layer-2" aria-hidden="true"></div>
                <div className="app-bg-layer layer-3" aria-hidden="true"></div>
                
                <div className="app-overlay">
                    <header className="app-header" role="banner">
                        <div className="logo" aria-label="Nimbus Weather App">
                            <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                            </svg>
                            <span className="logo-text">Nimbus</span>
                        </div>
                        <div className="header-actions" role="navigation" aria-label="Header controls">
                            <button 
                                className="unit-toggle" 
                                onClick={toggleUnit} 
                                title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
                                aria-label={`Current unit is ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}, click to switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                                type="button"
                            >
                                <span className="unit-text">°{unit}</span>
                            </button>
                            <button 
                                className="geo-btn" 
                                onClick={handleGeolocation} 
                                title="Use my current location"
                                aria-label="Get weather for my current location"
                                disabled={loading}
                                type="button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                        <div className="error-banner" role="alert" aria-live="assertive" aria-atomic="true">
                            <svg className="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v4M12 16h.01"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {loading && !weather && (
                        <div className="loader-container" aria-live="polite" aria-busy="true">
                            <div className="loader-wrapper">
                                <div className="loader"></div>
                                <div className="loader-ring"></div>
                            </div>
                            <p className="loader-text">Fetching weather data...</p>
                        </div>
                    )}

                    {weather && weather.cod === 200 && (
                        <main ref={contentRef} className={`weather-content ${animateIn ? 'animate-in' : ''}`} role="main">
                            <MemoizedCurrentWeather
                                weather={weather}
                                locationName={locationName}
                                convertTemp={convertTemp}
                                unit={unit}
                                lastUpdated={lastUpdated}
                                animateIn={animateIn}
                            />
                            <MemoizedWeatherDetails weather={weather} animateIn={animateIn} />
                            {forecast && <MemoizedForecast forecast={forecast} convertTemp={convertTemp} unit={unit} animateIn={animateIn} />}
                        </main>
                    )}

                    {!weather && !loading && !error && (
                        <div className="welcome" role="status" aria-label="Welcome message">
                            <div className="welcome-icon" aria-hidden="true">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="4"/>
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                                </svg>
                            </div>
                            <h2>Welcome to Nimbus</h2>
                            <p>Search for a city or use your location to get detailed weather information</p>
                        </div>
                    )}

                    <footer className="app-footer" role="contentinfo">
                        <span>Weather data provided by OpenWeatherMap</span>
                    </footer>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default App;
