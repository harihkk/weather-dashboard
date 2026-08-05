import React from 'react';

function Forecast({ forecast, convertTemp, unit, animateIn }) {
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
        .map(([date, data], index) => {
            const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const high = Math.max(...data.temps);
            const low = Math.min(...data.temps);
            const midIdx = Math.floor(data.icons.length / 2);
            // Calculate bar width based on temperature range
            const allHighs = Object.values(dailyMap).map(d => Math.max(...d.temps));
            const allLows = Object.values(dailyMap).map(d => Math.min(...d.temps));
            const maxTemp = Math.max(...allHighs);
            const minTemp = Math.min(...allLows);
            const tempRange = maxTemp - minTemp || 1;
            const barWidth = ((high - minTemp) / tempRange) * 100;
            
            return {
                day: dayName,
                high: convertTemp(high),
                low: convertTemp(low),
                icon: data.icons[midIdx],
                desc: data.descriptions[midIdx],
                barWidth,
                delay: index * 80
            };
        });

    return (
        <section className={`forecast ${animateIn ? 'animate-in' : ''}`}>
            <h3 className="section-title">5-Day Forecast</h3>
            <div className="forecast-list" role="list">
                {days.map((d, i) => (
                    <div 
                        className="forecast-card" 
                        key={i}
                        style={{ '--card-delay': `${d.delay}ms` }}
                        role="listitem"
                    >
                        <span className="forecast-day">{d.day}</span>
                        <div className="forecast-icon-wrapper">
                            <img
                                src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                                alt={d.desc}
                                className="forecast-icon"
                                loading="lazy"
                            />
                        </div>
                        <div className="forecast-temps">
                            <span className="forecast-high">{d.high}°</span>
                            <div className="temp-bar" aria-hidden="true">
                                <div 
                                    className="temp-bar-fill" 
                                    style={{ width: `${d.barWidth}%`, '--bar-delay': `${d.delay + 200}ms` }}
                                ></div>
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
