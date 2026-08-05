import React, { memo } from 'react';

const CurrentWeather = memo(function CurrentWeather({ weather, locationName, convertTemp, unit, lastUpdated, animateIn }) {
    const desc = weather.weather?.[0]?.description || '';
    const icon = weather.weather?.[0]?.icon;
    const temp = convertTemp(weather.main.temp);
    const feelsLike = convertTemp(weather.main.feels_like);
    const high = convertTemp(weather.main.temp_max);
    const low = convertTemp(weather.main.temp_min);

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section 
            className={`current-weather ${animateIn ? 'animate-in' : ''}`} 
            role="region" 
            aria-label="Current weather conditions"
            aria-live="polite"
        >
            <div className="current-top">
                <div className="current-location">
                    <h1 className="location-title">{locationName}</h1>
                    {lastUpdated && <span className="updated">Updated {formatTime(lastUpdated)}</span>}
                </div>
            </div>
            <div className="current-main">
                <div className="current-temp-group">
                    <div className="current-icon-wrapper">
                        <div className="current-icon-glow" aria-hidden="true"></div>
                        <div className="current-icon">
                            {icon && (
                                <img 
                                    src={`https://openweathermap.org/img/wn/${icon}@4x.png`} 
                                    alt={`${desc} weather icon`} 
                                    loading="eager"
                                    className="weather-icon-img"
                                    width="120"
                                    height="120"
                                />
                            )}
                        </div>
                    </div>
                    <div className="current-temp" aria-label={`Temperature: ${temp} degrees ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}>
                        <span className="temp-value" aria-hidden="true">{temp}</span>
                        <span className="temp-unit">°{unit}</span>
                    </div>
                </div>
                <div className="current-summary">
                    <p className="condition">{desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
                    <p className="high-low">
                        <span className="temp-high">H: {high}°</span>
                        <span className="temp-separator" aria-hidden="true">&nbsp;&nbsp;</span>
                        <span className="temp-low">L: {low}°</span>
                    </p>
                    <p className="feels-like">Feels like {feelsLike}°{unit}</p>
                </div>
            </div>
        </section>
    );
});

export default CurrentWeather;
