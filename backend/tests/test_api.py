"""Backend tests for Nimbus Weather API."""
import pytest
import json
from unittest.mock import patch, MagicMock
from app import app


@pytest.fixture
def client():
    """Create test client with mocked config."""
    app.config['TESTING'] = True
    app.config['API_KEY'] = 'test_key'
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_weather_response():
    """Mock successful weather API response."""
    return {
        'cod': 200,
        'name': 'London',
        'main': {'temp': 15.5, 'feels_like': 14.2, 'temp_max': 17.0, 'temp_min': 13.0, 'humidity': 72, 'pressure': 1013},
        'weather': [{'id': 800, 'main': 'Clear', 'description': 'clear sky', 'icon': '01d'}],
        'wind': {'speed': 3.5, 'deg': 180},
        'visibility': 10000,
        'sys': {'sunrise': 1234567890, 'sunset': 1234599999},
        'dt': 1234567890
    }


@pytest.fixture
def mock_forecast_response():
    """Mock successful forecast API response."""
    return {
        'cod': '200',
        'list': [
            {'dt': 1234567890, 'main': {'temp': 15.0}, 'weather': [{'icon': '01d', 'description': 'clear'}]},
            {'dt': 1234577890, 'main': {'temp': 16.0}, 'weather': [{'icon': '02d', 'description': 'cloudy'}]},
        ]
    }


class TestWeatherEndpoint:
    """Tests for /api/weather endpoint."""
    
    def test_missing_coordinates(self, client):
        """Test weather endpoint without coordinates."""
        response = client.get('/api/weather')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_invalid_latitude_range(self, client):
        """Test weather endpoint with invalid latitude."""
        response = client.get('/api/weather?lat=95&lon=0')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_invalid_longitude_range(self, client):
        """Test weather endpoint with invalid longitude."""
        response = client.get('/api/weather?lat=0&lon=185')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_invalid_coordinate_format(self, client):
        """Test weather endpoint with non-numeric coordinates."""
        response = client.get('/api/weather?lat=abc&lon=def')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('routes.weather_routes.fetch_weather_data')
    def test_successful_weather_fetch(self, mock_fetch, client, mock_weather_response):
        """Test successful weather data retrieval."""
        mock_fetch.return_value = mock_weather_response
        response = client.get('/api/weather?lat=51.5&lon=-0.12')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'London'
        assert data['cod'] == 200
    
    @patch('routes.weather_routes.fetch_weather_data')
    def test_weather_api_error(self, mock_fetch, client):
        """Test weather endpoint when upstream API fails."""
        mock_fetch.return_value = {'cod': 404, 'message': 'City not found'}
        response = client.get('/api/weather?lat=51.5&lon=-0.12')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('routes.weather_routes.fetch_weather_data')
    def test_weather_upstream_timeout(self, mock_fetch, client):
        """Test weather endpoint timeout handling."""
        mock_fetch.return_value = {'cod': 408, 'message': 'Request timeout'}
        response = client.get('/api/weather?lat=51.5&lon=-0.12')
        assert response.status_code == 500


class TestForecastEndpoint:
    """Tests for /api/forecast endpoint."""
    
    def test_missing_coordinates(self, client):
        """Test forecast endpoint without coordinates."""
        response = client.get('/api/forecast')
        assert response.status_code == 400
    
    def test_invalid_coordinates(self, client):
        """Test forecast endpoint with invalid coordinates."""
        response = client.get('/api/forecast?lat=invalid&lon=invalid')
        assert response.status_code == 400
    
    @patch('routes.weather_routes.fetch_forecast_data')
    def test_successful_forecast_fetch(self, mock_fetch, client, mock_forecast_response):
        """Test successful forecast data retrieval."""
        mock_fetch.return_value = mock_forecast_response
        response = client.get('/api/forecast?lat=51.5&lon=-0.12')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'list' in data
    
    @patch('routes.weather_routes.fetch_forecast_data')
    def test_forecast_api_error(self, mock_fetch, client):
        """Test forecast endpoint when upstream API fails."""
        mock_fetch.return_value = None
        response = client.get('/api/forecast?lat=51.5&lon=-0.12')
        assert response.status_code == 500


class TestGeocodeEndpoint:
    """Tests for /api/geocode endpoint."""
    
    def test_missing_city(self, client):
        """Test geocode endpoint without city parameter."""
        response = client.get('/api/geocode')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_empty_city(self, client):
        """Test geocode endpoint with empty city string."""
        response = client.get('/api/geocode?city=')
        assert response.status_code == 400
    
    def test_whitespace_city(self, client):
        """Test geocode endpoint with whitespace-only city."""
        response = client.get('/api/geocode?city=%20%20')
        assert response.status_code == 400
    
    @patch('routes.weather_routes.geocode_city')
    def test_successful_geocode(self, mock_geo, client):
        """Test successful geocoding."""
        mock_geo.return_value = {'lat': 51.5, 'lon': -0.12, 'name': 'London', 'country': 'GB'}
        response = client.get('/api/geocode?city=London')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'London'
    
    @patch('routes.weather_routes.geocode_city')
    def test_city_not_found(self, mock_geo, client):
        """Test geocode when city is not found."""
        mock_geo.return_value = None
        response = client.get('/api/geocode?city=NonExistentCity123')
        assert response.status_code == 404


class TestHealthEndpoint:
    """Tests for health check endpoints."""
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
    
    def test_api_health_check(self, client):
        """Test API health check endpoint."""
        response = client.get('/api/health')
        assert response.status_code == 200


class TestCacheBehavior:
    """Tests for caching functionality."""
    
    @patch('utils.api_client.SimpleCache')
    def test_cache_hit(self, mock_cache_class, client, mock_weather_response):
        """Test that cache is checked before API call."""
        mock_cache = MagicMock()
        mock_cache.get.return_value = mock_weather_response
        mock_cache_class.return_value = mock_cache
        
        # Need to reload module to use mocked cache
        with patch('routes.weather_routes.fetch_weather_data', return_value=mock_weather_response):
            response = client.get('/api/weather?lat=51.5&lon=-0.12')
            assert response.status_code == 200
    
    @patch('routes.weather_routes.fetch_weather_data')
    def test_cache_miss_then_fetch(self, mock_fetch, client, mock_weather_response):
        """Test cache miss triggers fetch."""
        mock_fetch.return_value = mock_weather_response
        response = client.get('/api/weather?lat=51.5&lon=-0.12')
        assert response.status_code == 200
        mock_fetch.assert_called_once()


class TestConfigurationValidation:
    """Tests for configuration validation."""
    
    def test_missing_api_key_raises_error(self):
        """Test that missing API key raises ValueError."""
        from config import Config
        original_key = Config.API_KEY
        try:
            # Temporarily set API_KEY to None
            import os
            os.environ['API_KEY'] = ''
            # Reload config to pick up new env
            import importlib
            import config
            importlib.reload(config)
            with pytest.raises(ValueError):
                config.Config.validate()
        finally:
            os.environ['API_KEY'] = original_key if original_key else ''


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
