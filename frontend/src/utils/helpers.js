/**
 * Utility functions for weather data processing and formatting
 */

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => Math.round((celsius * 9 / 5) + 32);

/**
 * Convert meters per second to various units
 * @param {number} mps - Wind speed in meters per second
 * @param {string} unit - Target unit ('mps', 'kmh', 'mph', 'knots')
 * @returns {number} Converted wind speed
 */
export const convertWindSpeed = (mps, unit = 'mps') => {
  const conversions = {
    mps: (v) => v,
    kmh: (v) => Math.round(v * 3.6),
    mph: (v) => Math.round(v * 2.237),
    knots: (v) => Math.round(v * 1.944)
  };
  return conversions[unit] ? conversions[unit](mps) : mps;
};

/**
 * Convert meters to kilometers or miles
 * @param {number} meters - Distance in meters
 * @param {boolean} useImperial - Use miles instead of kilometers
 * @returns {string} Formatted distance with unit
 */
export const formatVisibility = (meters, useImperial = false) => {
  if (!meters && meters !== 0) return '--';
  
  if (useImperial) {
    const miles = meters * 0.000621371;
    return miles < 1 
      ? `${Math.round(meters * 3.28084)} ft` 
      : `${miles.toFixed(1)} mi`;
  }
  
  const km = meters / 1000;
  return km < 1 ? `${meters} m` : `${km.toFixed(1)} km`;
};

/**
 * Format wind direction from degrees to cardinal direction
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export const getWindDirection = (degrees) => {
  if (degrees === undefined || degrees === null) return '--';
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

/**
 * Calculate dew point using Magnus formula
 * @param {number} temp - Temperature in Celsius
 * @param {number} humidity - Relative humidity percentage
 * @returns {number} Dew point in Celsius
 */
export const calculateDewPoint = (temp, humidity) => {
  if (temp === undefined || humidity === undefined) return null;
  
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
};

/**
 * Get weather condition category from weather ID
 * @param {number} weatherId - OpenWeatherMap weather ID
 * @returns {string} Weather category
 */
export const getWeatherCategory = (weatherId) => {
  if (!weatherId) return 'unknown';
  
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 500) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'atmosphere';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800 && weatherId <= 804) return 'clouds';
  return 'unknown';
};

/**
 * Check if weather icon represents nighttime
 * @param {string} icon - Weather icon code
 * @returns {boolean} True if nighttime
 */
export const isNighttime = (icon) => {
  return icon ? icon.includes('n') : false;
};

/**
 * Get background theme class based on weather conditions
 * @param {Object} weather - Weather data object
 * @returns {string} CSS class for background theme
 */
export const getBackgroundTheme = (weather) => {
  if (!weather?.weather?.[0]) return 'bg-default';
  
  const id = weather.weather[0].id;
  const icon = weather.weather[0].icon;
  const night = isNighttime(icon);
  
  if (id >= 200 && id < 300) return 'bg-storm';
  if (id >= 300 && id < 500) return 'bg-rain';
  if (id >= 500 && id < 600) return 'bg-rain';
  if (id >= 600 && id < 700) return 'bg-snow';
  if (id >= 700 && id < 800) return 'bg-mist';
  if (id === 800) return night ? 'bg-clear-night' : 'bg-clear';
  if (id > 800 && id <= 804) return night ? 'bg-clouds-night' : 'bg-clouds';
  
  return night ? 'bg-clouds-night' : 'bg-clouds';
};

/**
 * Group forecast data by local date using timezone offset
 * @param {Array} list - Forecast list from API
 * @param {number} timezoneOffset - Timezone offset in seconds from UTC
 * @returns {Object} Grouped forecast by date
 */
export const groupForecastByDate = (list, timezoneOffset = 0) => {
  if (!list || !Array.isArray(list)) return {};
  
  const grouped = {};
  
  list.forEach(item => {
    // Create date with timezone offset
    const utcDate = new Date(item.dt * 1000);
    const localDate = new Date(utcDate.getTime() + timezoneOffset * 1000);
    const dateKey = localDate.toISOString().split('T')[0];
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        temps: [],
        icons: [],
        descriptions: [],
        dt: item.dt,
        dateObj: localDate
      };
    }
    
    grouped[dateKey].temps.push(item.main.temp);
    grouped[dateKey].icons.push(item.weather[0].icon);
    grouped[dateKey].descriptions.push(item.weather[0].description);
  });
  
  return grouped;
};

/**
 * Get day name from date string using city's timezone
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting
 * @returns {string} Short day name (e.g., "Mon")
 */
export const getDayName = (dateString, locale = 'en-US') => {
  try {
    return new Date(dateString + 'T12:00:00').toLocaleDateString(locale, { 
      weekday: 'short' 
    });
  } catch {
    return dateString;
  }
};

/**
 * Format timestamp to local time string
 * @param {number} timestamp - Unix timestamp
 * @param {number} timezoneOffset - Timezone offset in seconds
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatLocalTime = (timestamp, timezoneOffset = 0, options = {}) => {
  if (!timestamp) return '--';
  
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const defaultOptions = { hour: '2-digit', minute: '2-digit' };
  
  try {
    return date.toLocaleTimeString([], { ...defaultOptions, ...options });
  } catch {
    return date.toLocaleTimeString();
  }
};

/**
 * Format date with timezone awareness
 * @param {number} timestamp - Unix timestamp
 * @param {number} timezoneOffset - Timezone offset in seconds
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatLocalDate = (timestamp, timezoneOffset = 0, options = {}) => {
  if (!timestamp) return '--';
  
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const defaultOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  
  try {
    return date.toLocaleDateString([], { ...defaultOptions, ...options });
  } catch {
    return date.toLocaleDateString();
  }
};

/**
 * Safely parse and validate localStorage data
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
export const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    
    // Validate array structure for recent searches/favorites
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.warn(`Invalid localStorage data for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set localStorage data with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate daylight duration
 * @param {number} sunrise - Sunrise timestamp
 * @param {number} sunset - Sunset timestamp
 * @returns {string} Formatted duration string
 */
export const calculateDaylightDuration = (sunrise, sunset) => {
  if (!sunrise || !sunset) return '--';
  
  const durationMs = (sunset - sunrise) * 1000;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};
