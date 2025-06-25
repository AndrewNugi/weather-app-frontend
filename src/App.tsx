import React, { useState, useEffect } from 'react';
import { X, Menu, Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Search, Eye, Gauge, CloudSnow, Zap, CloudDrizzle, Sunset, Sunrise } from 'lucide-react';

// Define interfaces for weather data and city information
interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneAbbreviation: string;
  };
  current: {
    time: string;
    temperature: number;
    humidity: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    humidity: number[];
    weatherCode: number[];
    windSpeed: number[];
    windDirection: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitation: number[];
    windSpeedMax: number[];
  };
}

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // Optional administrative division
}

const WeatherApp: React.FC = () => {
  // State variables for weather data, loading, errors, search, and time
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Effect to update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSectionWithOffset = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const scrollTarget = elementTop + element.offsetHeight * -0.15;
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth',
      });
    }
  };

  // Maps weather codes to descriptive strings
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Light showers',
      81: 'Moderate showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Severe thunderstorm'
    };
    return weatherCodes[code] || 'Unknown';
  };

  // Returns a Lucide icon component based on weather code
  const getWeatherIcon = (code: number, size: string = "w-12 h-12") => {
    const iconClass = `${size} drop-shadow-lg transition-transform duration-300 group-hover:scale-110`;

    if (code === 0) return <Sun className={`${iconClass} text-yellow-300`} />;
    if (code === 1) return <Sun className={`${iconClass} text-yellow-200`} />;
    if (code === 2) return <Cloud className={`${iconClass} text-gray-300`} />;
    if (code === 3) return <Cloud className={`${iconClass} text-gray-400`} />;
    if (code >= 45 && code <= 48) return <Cloud className={`${iconClass} text-gray-500`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${iconClass} text-blue-300`} />;
    if (code >= 61 && code <= 65) return <CloudRain className={`${iconClass} text-blue-400`} />;
    if (code >= 71 && code <= 75) return <CloudSnow className={`${iconClass} text-blue-200`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${iconClass} text-blue-500`} />;
    if (code >= 95 && code <= 99) return <Zap className={`${iconClass} text-purple-400`} />;
    return <Cloud className={`${iconClass} text-gray-400`} />;
  };

  // Determines background gradient based on weather conditions
  const getBackgroundGradient = (code: number): string => {
    if (code === 0 || code === 1) return 'from-blue-400 via-blue-500 to-indigo-600'; // Clear/Sunny
    if (code === 2 || code === 3) return 'from-gray-400 via-gray-500 to-gray-700'; // Cloudy
    if (code >= 51 && code <= 82) return 'from-gray-600 via-blue-700 to-blue-900'; // Rain/Showers
    if (code >= 71 && code <= 75) return 'from-blue-300 via-blue-500 to-blue-700'; // Snow
    if (code >= 95 && code <= 99) return 'from-purple-700 via-purple-800 to-gray-900'; // Thunderstorm
    return 'from-blue-400 via-blue-500 to-blue-600'; // Default
  };

  // Converts wind degrees to cardinal direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  // Fetches weather data from the backend API
  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // NOTE: Replace with your actual backend API URL
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/weather?lat=${lat}&lon=${lon}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  // Searches for cities based on user input from the geocoding API
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    try {
      // NOTE: Replace with your actual backend API URL
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/geocode?city=${encodeURIComponent(query)}`
      );
      console.log ('URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
      const data = await response.json();
      setCities(data.results || []);
    } catch (err) {
      console.error('Failed to search cities:', err);
      // Optionally, set a user-friendly error for city search
    }
  };

  // Gets the user's current location using browser geolocation API
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Fetch weather data
          fetchWeather(lat, lon);
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reverse-geocode?lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const location = data.results[0];
              setSelectedCity(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`);
            } else {
              setSelectedCity('Current Location');
            }
          } catch (err) {
            console.error('Failed to get location name:', err);
            setSelectedCity('Current Location'); // Fallback
          }
        },
        (error) => {
          setError('Unable to retrieve your current location. Please allow location access or search for a city.');
          console.error(error);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please search for a city manually.');
    }
  };

  // Handles selection of a city from search results
  const handleCitySelect = (city: City) => {
    setSelectedCity(`${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}`);
    setSearchQuery(''); // Clear search input
    setCities([]); // Clear search results
    fetchWeather(city.latitude, city.longitude);
  };

  // Formats date string for display (e.g., "Mon, Jan 1")
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formats time string for display (e.g., "10:00 AM")
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Use AM/PM format
    });
  };

  // Effect to debounce city search queries
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [searchQuery]);

  // Effect to get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Determine background gradient based on current weather or default
  const backgroundGradient = weatherData 
    ? getBackgroundGradient(weatherData.current.weatherCode)
    : 'from-blue-400 via-blue-500 to-blue-600';

  return (
    // Main container with dynamic background gradient and subtle animations
    <div className={`min-h-screen font-sans bg-gradient-to-br ${backgroundGradient} transition-all duration-1000 ease-in-out relative overflow-hidden`}>
      
      {/* Header */}
      <header
        className={`fixed z-50 transition-all duration-300 transform ${scrollY > 90 ? 'top-4' : 'top-0'
          } w-full`}
      >
        
        <div
          className={`mx-auto transition-all duration-300 ${scrollY > 90
            ? 'w-[85%] bg-transparent backdrop-blur-md shadow-lg rounded-2xl px-[10px]'
            : 'w-full bg-transparent px-[10px] rounded-none'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
                  <span className="text-white font-poppins font-semibold text-xl">🌤</span>
                </div>
                <span
                  className={`ml-3 text-xl font-inter font-semibold transition-colors duration-300 ${scrollY > 70 ? 'text-gray-900' : 'text-white'
                    }`}
                >
                  Weather Forecast From Nugi
                </span>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                {['Search','Your Weather', '24 Hr Forecast', '7 Day Forecast'].map((link) => (
                  <a
                    key={link}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSectionWithOffset(`${link}`);
                    }}
                    className={`font-poppins font-medium transition-colors cursor-pointer ${scrollY > 90
                      ? 'text-gray-700 hover:text-blue-600 hover:border-b-1'
                      : 'text-white hover:text-blue-200 hover:border-b-1'
                      }`}
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                  </a>
                ))}
              </nav>


              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className={`w-6 h-6 ${scrollY > 90 ? 'text-gray-900' : 'text-white'}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${scrollY > 90 ? 'text-gray-900' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className={`fixed z-40 transition-all duration-300 ${scrollY > 90
            ? 'top-[calc(2rem+60px)] right-[7.5%] w-[200px]'
            : 'top-[60px] right-4 w-[200px]'
            } md:hidden bg-white/95 backdrop-blur-md shadow-lg border-none rounded-lg`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['Search', 'Your Weather', '24 Hr Forecast', '7 Day Forecast'].map((link) => (
              <a
                key={link}
                href={`#${link}`}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="capitalize">{link}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Animated background elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -right-24 w-100 h-100 bg-white opacity-5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute -bottom-16 left-1/4 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-8 flex items-start justify-center">
        <div className="max-w-7xl w-full mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 pt-12">
            <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-3 drop-shadow-2xl tracking-tight">
              SkyView
            </h1>
            <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-white/60 text-base md:text-lg">
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>

          {/* Search Section - Added relative and z-index here */}
          <div className="relative z-20 backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 mb-8 border border-white/20 shadow-2xl">
            <div className="relative">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search id="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for any city worldwide..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/15 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 transition-all duration-300 text-lg shadow-md"
                  />
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 border border-white/30 text-lg font-medium shadow-md"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="hidden md:inline">Current Location</span>
                </button>
              </div>

              {/* City Search Results Dropdown - Adjusted z-index slightly for clarity within its new parent */}
              {cities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-30 border border-white/20">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className="group w-full text-left px-6 py-4 text-gray-800 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="font-semibold text-lg group-hover:text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-600">
                        {city.admin1 && `${city.admin1}, `}{city.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected City Display */}
            {selectedCity && (
              <div className="mt-6 flex items-center space-x-3 text-white/90 text-xl font-medium">
                <MapPin className="w-5 h-5 text-white/70" />
                <p>{selectedCity}</p>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
              <p className="text-white text-2xl mt-6 font-medium">Fetching the latest weather data...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="backdrop-blur-md bg-red-500/20 rounded-3xl p-6 md:p-8 mb-8 border border-red-400/30">
              <p className="text-white text-center text-lg font-medium">{error}</p>
            </div>
          )}

          {/* Weather Data Display */}
          {weatherData && (
            <div id="Your Weather" className="space-y-8">
              {/* Main Weather Card (Current Conditions) - No z-index needed here, as the search section now has a higher one */}
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6 group">
                    {getWeatherIcon(weatherData.current.weatherCode, "w-24 h-24")}
                  </div>
                  <h2 className="text-7xl md:text-8xl font-bold text-white mb-2 drop-shadow-lg">
                    {Math.round(weatherData.current.temperature)}°
                  </h2>
                  <p className="text-3xl text-white/90 mb-3 font-medium">
                    {getWeatherDescription(weatherData.current.weatherCode)}
                  </p>
                  <p className="text-white/70 text-xl">
                    {formatTime(weatherData.current.time)}
                  </p>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-5 bg-white/10 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 shadow-lg group">
                    <Droplets className="w-9 h-9 text-blue-300 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-white/70 text-sm font-light">Humidity</p>
                    <p className="text-white text-2xl font-bold">
                      {Math.round(weatherData.current.humidity)}%
                    </p>
                  </div>
                  <div className="text-center p-5 bg-white/10 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 shadow-lg group">
                    <Wind className="w-9 h-9 text-green-300 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-white/70 text-sm font-light">Wind Speed</p>
                    <p className="text-white text-2xl font-bold">
                      {Math.round(weatherData.current.windSpeed)} km/h
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {getWindDirection(weatherData.current.windDirection)}
                    </p>
                  </div>
                  <div className="text-center p-5 bg-white/10 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 shadow-lg group">
                    <Eye className="w-9 h-9 text-purple-300 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-white/70 text-sm font-light">Visibility</p>
                    <p className="text-white text-2xl font-bold">10 km</p> {/* Static for now, can be dynamic */}
                  </div>
                  <div className="text-center p-5 bg-white/10 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 shadow-lg group">
                    <Gauge className="w-9 h-9 text-orange-300 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-white/70 text-sm font-light">Pressure</p>
                    <p className="text-white text-2xl font-bold">1013 hPa</p> {/* Static for now, can be dynamic */}
                  </div>
                </div>
              </div>

              {/* Hourly Forecast Section */}
              <div id="24 Hr Forecast" className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Sunrise className="w-7 h-7 mr-3 text-yellow-300" />
                  24-Hour Forecast
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
                  {weatherData.hourly.time.slice(0, 24).map((time, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm min-w-[120px] transition-all duration-300 hover:bg-white/20 shadow-md group"
                    >
                      <p className="text-white/70 text-sm mb-2 font-medium">
                        {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                      </p>
                      <div className="flex justify-center mb-2 group">
                        {getWeatherIcon(weatherData.hourly.weatherCode[index], "w-10 h-10")}
                      </div>
                      <p className="text-white font-bold text-xl">
                        {Math.round(weatherData.hourly.temperature[index])}°
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {Math.round(weatherData.hourly.windSpeed[index])} km/h
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Forecast Section */}
              <div id="7 Day Forecast" className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Sunset className="w-7 h-7 mr-3 text-orange-300" />
                  7-Day Forecast
                </h3>
                <div className="space-y-4">
                  {weatherData.daily.time.slice(0, 7).map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 shadow-md group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="group">
                          {getWeatherIcon(weatherData.daily.weatherCode[index], "w-12 h-12")}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xl">
                            {index === 0 ? 'Today' : formatDate(date)}
                          </p>
                          <p className="text-white/70 text-sm">
                            {getWeatherDescription(weatherData.daily.weatherCode[index])}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <span className="text-white text-3xl font-bold">
                          {Math.round(weatherData.daily.temperatureMax[index])}°
                        </span>
                        <span className="text-white/60 text-xl font-medium">
                          {Math.round(weatherData.daily.temperatureMin[index])}°
                        </span>
                      </div>
                      <p className="text-white/60 text-sm ml-4 min-w-[60px] text-right">
                        {Math.round(weatherData.daily.precipitation[index])} mm
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
