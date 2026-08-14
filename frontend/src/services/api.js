/**
 * API Service for Nimbus Weather Application
 * Handles all HTTP requests to the backend with proper error handling
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic request handler with timeout and error handling
async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 408);
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error or other fetch failure
    throw new ApiError(
      'Network error. Please check your connection.',
      0,
      { originalError: error.message }
    );
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
  
  isNotFound() {
    return this.status === 404;
  }
  
  isUnauthorized() {
    return this.status === 401;
  }
  
  isRateLimit() {
    return this.status === 429;
  }
  
  isServerError() {
    return this.status >= 500;
  }
}

// Weather API methods
export const weatherApi = {
  /**
   * Get current weather for coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data
   */
  getCurrentWeather(lat, lon) {
    return request(`/weather?lat=${lat}&lon=${lon}`);
  },
  
  /**
   * Get forecast for coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Forecast data
   */
  getForecast(lat, lon) {
    return request(`/forecast?lat=${lat}&lon=${lon}`);
  },
  
  /**
   * Geocode city name to coordinates
   * @param {string} city - City name
   * @returns {Promise<Object>} Geocoding result with lat, lon, name, country
   */
  geocodeCity(city) {
    return request(`/geocode?city=${encodeURIComponent(city.trim())}`);
  },
  
  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  healthCheck() {
    return request('/health');
  }
};

export default weatherApi;
