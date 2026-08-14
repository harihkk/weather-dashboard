/**
 * Custom hook for managing search with debouncing and suggestions
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { weatherApi, ApiError } from '../services/api';
import { debounce } from '../utils/helpers';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const results = await weatherApi.geocodeCity(searchQuery);
      
      // Handle single result vs array
      const resultArray = Array.isArray(results) ? results : (results ? [results] : []);
      
      setSuggestions(resultArray.map(r => ({
        id: `${r.lat}-${r.lon}`,
        name: r.name,
        country: r.country,
        state: r.state,
        lat: r.lat,
        lon: r.lon,
        displayName: formatDisplayName(r)
      })));
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err instanceof ApiError && err.isNotFound()) {
        setSuggestions([]);
      } else {
        console.warn('Failed to fetch suggestions:', err);
        setSuggestions([]);
      }
    }
  }, []);

  const formatDisplayName = (result) => {
    const parts = [];
    if (result.name) parts.push(result.name);
    if (result.state) parts.push(result.state);
    if (result.country) parts.push(result.country);
    return parts.join(', ');
  };

  // Debounced version of fetchSuggestions
  const debouncedFetch = useRef(
    debounce((q) => fetchSuggestions(q), 300)
  ).current;

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    setError(null);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
  }, []);

  const selectSuggestion = useCallback((suggestion) => {
    setQuery(suggestion.displayName);
    setSuggestions([]);
    return suggestion;
  }, []);

  return {
    query,
    suggestions,
    loading,
    error,
    handleInputChange,
    clearSuggestions,
    selectSuggestion,
    setQuery
  };
};

export default useSearch;
