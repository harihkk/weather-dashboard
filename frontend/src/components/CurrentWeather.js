import React from 'react';

function CurrentWeather({ weather, locationName, convertTemp, unit, lastUpdated }) {
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
        <section className="current-weather">
            <div className="current-top">
                <div className="current-location">
                    <h1>{locationName}</h1>
                    {lastUpdated && <span className="updated">Updated {formatTime(lastUpdated)}</span>}
                </div>
            </div>
            <div className="current-main">
                <div className="current-temp-group">
                    <div className="current-icon">
                        {icon && <img src={`https://openweathermap.org/img/wn/${icon}@4x.png`} alt={desc} />}
                    </div>
                    <div className="current-temp">
                        <span className="temp-value">{temp}</span>
                        <span className="temp-unit">°{unit}</span>
                    </div>
                </div>
                <div className="current-summary">
                    <p className="condition">{desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
                    <p className="high-low">H: {high}° &nbsp; L: {low}°</p>
                    <p className="feels-like">Feels like {feelsLike}°{unit}</p>
                </div>
            </div>
        </section>
    );
}

export default CurrentWeather;
