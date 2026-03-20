import React from 'react';

function Forecast({ forecast, convertTemp, unit }) {
    if (!forecast?.list) return null;

    const dailyMap = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap[date]) {
            dailyMap[date] = { temps: [], icons: [], descriptions: [], dt: item.dt };
        }
        dailyMap[date].temps.push(item.main.temp);
        dailyMap[date].icons.push(item.weather[0].icon);
        dailyMap[date].descriptions.push(item.weather[0].description);
    });

    const today = new Date().toISOString().split('T')[0];
    const days = Object.entries(dailyMap)
        .filter(([date]) => date !== today)
        .slice(0, 5)
        .map(([date, data]) => {
            const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const high = Math.max(...data.temps);
            const low = Math.min(...data.temps);
            const midIdx = Math.floor(data.icons.length / 2);
            return {
                day: dayName,
                high: convertTemp(high),
                low: convertTemp(low),
                icon: data.icons[midIdx],
                desc: data.descriptions[midIdx],
            };
        });

    return (
        <section className="forecast">
            <h3>5-Day Forecast</h3>
            <div className="forecast-list">
                {days.map((d, i) => (
                    <div className="forecast-card" key={i}>
                        <span className="forecast-day">{d.day}</span>
                        <img
                            src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                            alt={d.desc}
                            className="forecast-icon"
                        />
                        <div className="forecast-temps">
                            <span className="forecast-high">{d.high}°</span>
                            <div className="temp-bar">
                                <div className="temp-bar-fill"></div>
                            </div>
                            <span className="forecast-low">{d.low}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Forecast;
