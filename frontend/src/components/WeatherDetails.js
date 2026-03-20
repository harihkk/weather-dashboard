import React from 'react';

function WeatherDetails({ weather }) {
    const sunrise = weather.sys?.sunrise
        ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--';
    const sunset = weather.sys?.sunset
        ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--';

    const details = [
        {
            label: 'Humidity',
            value: `${weather.main?.humidity || 0}%`,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
        },
        {
            label: 'Wind',
            value: `${weather.wind?.speed || 0} m/s`,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
        },
        {
            label: 'Pressure',
            value: `${weather.main?.pressure || 0} hPa`,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/></svg>
        },
        {
            label: 'Visibility',
            value: weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '--',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        },
        {
            label: 'Sunrise',
            value: sunrise,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/></svg>
        },
        {
            label: 'Sunset',
            value: sunset,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10V2M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 18a4 4 0 0 0-8 0M8 6l4 4 4-4"/></svg>
        },
    ];

    return (
        <section className="weather-details">
            <h3>Details</h3>
            <div className="details-grid">
                {details.map((d, i) => (
                    <div className="detail-card" key={i}>
                        <div className="detail-icon">{d.icon}</div>
                        <div className="detail-info">
                            <span className="detail-label">{d.label}</span>
                            <span className="detail-value">{d.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default WeatherDetails;
