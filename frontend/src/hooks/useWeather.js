/**
 * Custom hook for weather data fetching with proper error handling and cancellation
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { weatherApi, ApiError } from '../services/api';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [timezoneOffset, setTimezoneOffset] = useState(0);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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

    try {
      const [weatherData, forecastData] = await Promise.all([
        weatherApi.getCurrentWeather(lat, lon),
        weatherApi.getForecast(lat, lon)
      ]);

      if (!isMountedRef.current) return;

      // Extract timezone offset from weather data (in seconds)
      const tzOffset = weatherData.timezone || 0;
      
      setWeather(weatherData);
      setForecast(forecastData);
      setLocationName(name || weatherData.name || 'Unknown');
      setTimezoneOffset(tzOffset);
      
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.name === 'AbortError') return;

      if (err instanceof ApiError) {
        if (err.isNotFound()) {
          setError('City not found. Please try another search.');
        } else if (err.isServerError()) {
          setError('Weather service temporarily unavailable. Please try again later.');
        } else if (err.status === 0) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setWeather(null);
    setForecast(null);
    setLocationName('');
    setError(null);
  }, []);

  return {
    weather,
    forecast,
    loading,
    error,
    locationName,
    timezoneOffset,
    fetchWeatherByCoords,
    clearError,
    clearData
  };
};

export default useWeather;
