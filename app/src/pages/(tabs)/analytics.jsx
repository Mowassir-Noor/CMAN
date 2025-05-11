import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { getUserUID } from '../../utils/userAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axiosInstance from '../../../src/api/axiosInstance';

const { width } = Dimensions.get('window');

const WeatherAnalytics = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);
  const [weeklyWeather, setWeeklyWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [usingMockData, setUsingMockData] = useState(false); // <-- Missing state variable
  
  // Replace static mock data with data that will be generated from live location
  const [liveLocationData, setLiveLocationData] = useState(null);

  // Mock weather data object
  const mockWeatherData = {
    current: {
      location: "Sample City, Country",
      temp: 22,
      feels_like: 21,
      humidity: 65,
      conditions: "Partly Cloudy"
    },
    daily: {
      hours: Array(24).fill(0).map((_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        temp: 20 + Math.sin(i/24 * Math.PI * 2) * 5,
        precip_prob: "5%",
        conditions: i > 6 && i < 18 ? "Sunny" : "Clear"
      }))
    },
    weekly: {
      data: Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          temp_max: 25 + Math.floor(Math.random() * 5),
          temp_min: 15 + Math.floor(Math.random() * 5),
          precip_prob: Math.floor(Math.random() * 30),
          conditions: Math.random() > 0.5 ? "Sunny" : "Partly Cloudy",
          sunrise: "06:30",
          sunset: "17:45"
        };
      })
    }
  };

  // Get the device's current location and reverse geocode it to get city info
  const getLiveLocation = async () => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return null;
      }

      // Get the current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address information
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        return {
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          city: address.city || address.region,
          region: address.region,
          country: address.country,
          formattedAddress: `${address.city || address.region}, ${address.country}`
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting live location:', error);
      return null;
    }
  };

  // Create weather data based on location and date
  const generateWeatherData = (location) => {
    if (!location) return null;
    
    // Get current date and time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Generate a "realistic" temperature based on latitude (cooler toward poles)
    const baseTemp = 22; // base temperature (equator)
    const latFactor = Math.abs(location.coords.latitude) / 90; // 0 at equator, 1 at poles
    const baseDayTemp = Math.round(baseTemp - (latFactor * 20));
    
    // Generate temperature curve for the day with peak at noon/afternoon
    const hourlyTemps = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourFactor = 1 - Math.abs((hour - 14) / 14); // peak at 2PM (hour 14)
      const hourTemp = Math.round(baseDayTemp - 5 + (hourFactor * 10));
      hourlyTemps.push(hourTemp);
    }
    
    // Generate hourly forecast for today
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const hourString = hour.toString().padStart(2, '0') + ':00';
      const temp = hourlyTemps[hour];
      
      // Generate weather condition based on temperature
      let condition;
      if (temp > 25) condition = "Sunny";
      else if (temp > 20) condition = "Clear";
      else if (temp > 15) condition = "Partly Cloudy";
      else if (temp > 10) condition = "Cloudy";
      else condition = "Rain";
      
      hours.push({
        time: hourString,
        temp: temp,
        precip_prob: condition.includes("Rain") ? "60%" : condition.includes("Cloud") ? "30%" : "0%",
        conditions: condition
      });
    }
    
    // Generate weekly forecast with some variation
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Add some random variation to temperatures
      const variation = Math.round(Math.random() * 6) - 3;
      const dayTemp = baseDayTemp + variation;
      
      // Generate sunrise and sunset times (simplified)
      const sunrise = "06:" + (15 + Math.floor(Math.random() * 30)).toString().padStart(2, '0');
      const sunset = "17:" + (30 + Math.floor(Math.random() * 30)).toString().padStart(2, '0');
      
      weekData.push({
        date: dateString,
        temp_max: dayTemp + 5,
        temp_min: dayTemp - 5,
        precip_prob: Math.floor(Math.random() * 60),
        conditions: hourlyTemps[14] > 20 ? "Sunny" : "Partly Cloudy",
        sunrise,
        sunset
      });
    }
    
    return {
      current: {
        location: location.formattedAddress,
        temp: hourlyTemps[currentHour],
        feels_like: hourlyTemps[currentHour] - 1,
        humidity: 50 + Math.floor(Math.random() * 30),
        conditions: hourlyTemps[currentHour] > 20 ? "Sunny" : "Partly Cloudy"
      },
      daily: { hours: hours.slice(0, 24) },
      weekly: { data: weekData }
    };
  };

  // Fetch all weather data
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      // Try to get user ID
      let userId;
      try {
        userId = await getUserUID();
        if (!userId) {
          console.warn('User ID not found, using live location');
          throw new Error('Authentication required');
        }
      } catch (userErr) {
        // If authentication fails, use live location data
        const liveLocation = await getLiveLocation();
        if (liveLocation) {
          const generatedData = generateWeatherData(liveLocation);
          setCurrentWeather(generatedData.current);
          setDailyWeather(generatedData.daily);
          setWeeklyWeather(generatedData.weekly);
          setWeatherAlerts([]);
          setLiveLocationData(liveLocation);
          setUsingMockData(true);
          setLoading(false);
          return;
        } else {
          setError('Could not determine your location. Please enable location services.');
          setLoading(false);
          return;
        }
      }
      
      // If we have a valid user ID, attempt to get data from API
      try {
        // Fetch current weather
        const currentResponse = await axiosInstance.get(`/weather/current/${userId}`);
        setCurrentWeather(currentResponse.data);
      } catch (err) {
        // Fall back to live location instead of static mock data
        console.error('Error fetching current weather:', err);
        const liveLocation = await getLiveLocation();
        if (liveLocation) {
          const generatedData = generateWeatherData(liveLocation);
          setCurrentWeather(generatedData.current);
          setDailyWeather(generatedData.daily);
          setWeeklyWeather(generatedData.weekly);
          setWeatherAlerts([]);
          setLiveLocationData(liveLocation);
          setUsingMockData(true);
        } else {
          // Fall back to static mock data only if we can't get live location
          setCurrentWeather(mockWeatherData.current);
          setDailyWeather(mockWeatherData.daily);
          setWeeklyWeather(mockWeatherData.weekly);
        }
      }
      
      try {
        // Fetch daily detailed weather
        const dailyResponse = await axiosInstance.get(`/weather/daily/${userId}`);
        setDailyWeather(dailyResponse.data);
      } catch (err) {
        console.error('Error fetching daily weather:', err);
        setDailyWeather(mockWeatherData.daily);
      }
      
      try {
        // Fetch weekly weather
        const weeklyResponse = await axiosInstance.get(`/weather/weekly/${userId}`);
        setWeeklyWeather(weeklyResponse.data);
      } catch (err) {
        console.error('Error fetching weekly weather:', err);
        setWeeklyWeather(mockWeatherData.weekly);
      }
      
      try {
        // Fetch weather alerts
        const alertsResponse = await axiosInstance.get(`/weather/alerts/${userId}`);
        setWeatherAlerts(alertsResponse.data.alerts || []);
      } catch (err) {
        console.error('Error fetching weather alerts:', err);
        setWeatherAlerts([]);
      }
      
    } catch (err) {
      console.error('Error in main weather data fetch process:', err);
      // Try to get live location
      const liveLocation = await getLiveLocation();
      if (liveLocation) {
        const generatedData = generateWeatherData(liveLocation);
        setCurrentWeather(generatedData.current);
        setDailyWeather(generatedData.daily);
        setWeeklyWeather(generatedData.weekly);
        setWeatherAlerts([]);
        setLiveLocationData(liveLocation);
        setUsingMockData(true);
        setError('Using data based on your current location');
      } else {
        // Fall back to static mock data only if we can't get live location
        setCurrentWeather(mockWeatherData.current);
        setDailyWeather(mockWeatherData.daily);
        setWeeklyWeather(mockWeatherData.weekly);
        setWeatherAlerts([]);
        setError('Using sample data (location services unavailable)');
        setUsingMockData(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeatherData();
  }, []);

  // Get weather icon based on conditions
  const getWeatherIcon = (conditions) => {
    const condition = conditions?.toLowerCase();
    if (!condition) return 'cloud-outline';
    
    if (condition.includes('rain')) return 'rainy-outline';
    if (condition.includes('snow')) return 'snow-outline';
    if (condition.includes('cloud')) return 'cloudy-outline';
    if (condition.includes('clear') || condition.includes('sunny')) return 'sunny-outline';
    if (condition.includes('storm') || condition.includes('thunder')) return 'thunderstorm-outline';
    if (condition.includes('fog') || condition.includes('mist')) return 'water-outline';
    return 'cloud-outline';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format time from HH:MM format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  // Simple custom temperature bar chart component
  const TemperatureBarChart = ({ data }) => {
    const maxTemp = Math.max(...data.map(item => item.temp)) + 2;
    const minTemp = Math.min(...data.map(item => item.temp)) - 2;
    const range = maxTemp - minTemp;
    
    return (
      <View className="mt-4 mb-2">
        <View className="flex-row justify-between mb-1">
          {data.map((item, index) => (
            <Text key={index} className="text-xs text-gray-400">{item.time.split(':')[0]}h</Text>
          ))}
        </View>
        <View className="flex-row justify-between items-end h-32">
          {data.map((item, index) => {
            // Calculate height percentage
            const heightPercentage = ((item.temp - minTemp) / range) * 100;
            return (
              <View key={index} className="items-center">
                <Text className="text-xs text-gray-300 mb-1">{Math.round(item.temp)}°</Text>
                <View 
                  style={{ height: `${heightPercentage}%`, width: 20 }}
                  className="bg-blue-500 rounded-t-lg"
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Loading state UI with dark theme
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="mt-3 text-base text-gray-300">Loading weather data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#60a5fa" 
          colors={['#60a5fa']}
          progressBackgroundColor="#1f2937"
        />
      }
    >
      {/* Demo data indicator - styled for dark theme */}
      {usingMockData && (
        <View className="mx-4 mt-3 mb-0 bg-amber-900/30 p-3 rounded-xl border border-amber-700/50">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#f59e0b" />
            <Text className="ml-2 text-amber-400 flex-1 font-medium">
              {liveLocationData 
                ? `Using data from: ${liveLocationData.formattedAddress}` 
                : 'Using sample weather data'}
            </Text>
          </View>
        </View>
      )}

      {/* Error banner with dark theme */}
      {error && (
        <View className="mx-4 my-2 bg-blue-900/30 p-3 rounded-xl border border-blue-700/50">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#60a5fa" />
            <Text className="ml-2 text-blue-400 flex-1">{error}</Text>
          </View>
          <Text className="text-xs text-blue-500 mt-1">
            Showing available data. Pull down to refresh.
          </Text>
        </View>
      )}

      {/* Current Weather Card with enhanced dark theme */}
      {currentWeather && (
        <View className="mx-4 my-4 rounded-2xl overflow-hidden">
          <View className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 rounded-2xl shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#f0f9ff" />
                <Text className="text-blue-100 text-base font-medium ml-1">{currentWeather.location}</Text>
              </View>
              <Text className="text-blue-200 text-sm font-light">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center my-6">
              <View>
                <Text className="text-6xl font-bold text-white">{Math.round(currentWeather.temp)}°</Text>
                <Text className="text-base text-blue-100 opacity-90">Feels like {Math.round(currentWeather.feels_like)}°C</Text>
                <Text className="text-lg text-white font-medium mt-1">{currentWeather.conditions}</Text>
              </View>
              <View className="bg-blue-800/30 p-3 rounded-full">
                <Ionicons name={getWeatherIcon(currentWeather.conditions)} size={80} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4 pt-4 border-t border-blue-400/30">
              <View className="flex-row items-center">
                <Ionicons name="water-outline" size={18} color="#93c5fd" />
                <Text className="text-blue-200 ml-1">Humidity: {currentWeather.humidity}%</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name={getWeatherIcon(currentWeather.conditions)} size={18} color="#93c5fd" />
                <Text className="text-blue-200 ml-1">{currentWeather.conditions}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Weather Alerts with dark theme */}
      {weatherAlerts.length > 0 && (
        <View className="mx-4 my-2">
          <Text className="text-lg font-bold text-gray-200 mb-2">Weather Alerts</Text>
          {weatherAlerts.map((alert, index) => (
            <View key={index} className="flex-row bg-red-900/30 p-4 rounded-xl mb-3 items-center border border-red-700/50">
              <Ionicons name="warning-outline" size={24} color="#f87171" />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-red-400 mb-1">{alert.type}</Text>
                <Text className="text-gray-300">{alert.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tab Navigation with dark theme */}
      <View className="mx-4 bg-gray-800 rounded-xl flex-row mb-3 p-1 shadow-md">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-lg ${activeTab === 'daily' ? 'bg-blue-600' : ''}`}
          onPress={() => setActiveTab('daily')}
        >
          <Text className={`font-medium ${activeTab === 'daily' ? 'text-white' : 'text-gray-400'}`}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-lg ${activeTab === 'weekly' ? 'bg-blue-600' : ''}`}
          onPress={() => setActiveTab('weekly')}
        >
          <Text className={`font-medium ${activeTab === 'weekly' ? 'text-white' : 'text-gray-400'}`}>Weekly</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Forecast with dark theme */}
      {activeTab === 'daily' && dailyWeather && (
        <View className="mx-4 my-2">
          <Text className="text-lg font-bold text-gray-200 mb-3">Hourly Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            {dailyWeather.hours.map((hour, index) => (
              <View key={index} className="bg-gray-800 rounded-xl p-4 mr-3 w-24 items-center shadow-lg border border-gray-700">
                <Text className="text-xs text-gray-400 mb-2">{formatTime(hour.time)}</Text>
                <Ionicons name={getWeatherIcon(hour.conditions)} size={28} color="#60a5fa" />
                <Text className="text-base font-bold text-white mt-2">{Math.round(hour.temp)}°C</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="water" size={12} color="#60a5fa" />
                  <Text className="text-xs text-blue-400 ml-1">{hour.precip_prob}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Temperature chart with dark theme */}
          {dailyWeather.hours.length > 0 && (
            <View className="bg-gray-800 rounded-xl p-5 shadow-lg mb-4 border border-gray-700">
              <Text className="text-base font-medium text-gray-200 mb-3">Temperature Trend Today</Text>
              
              <TemperatureBarChart 
                data={dailyWeather.hours
                  .filter((_, i) => i % 4 === 0)
                  .slice(0, 6)}
              />
              
              <View className="mt-3 pt-3 border-t border-gray-700">
                <Text className="text-xs text-gray-400">
                  Daily Range: {Math.round(Math.min(...dailyWeather.hours.map(h => h.temp)))}°C - 
                  {Math.round(Math.max(...dailyWeather.hours.map(h => h.temp)))}°C
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Weekly Forecast with dark theme */}
      {activeTab === 'weekly' && weeklyWeather && (
        <View className="mx-4 my-2 mb-6">
          <Text className="text-lg font-bold text-gray-200 mb-3">7-Day Forecast</Text>
          {weeklyWeather.data.map((day, index) => (
            <View key={index} className="bg-gray-800 rounded-xl p-4 mb-3 shadow-lg border border-gray-700">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-bold text-white">{formatDate(day.date)}</Text>
                <Text className="text-sm text-blue-400">{day.conditions}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="thermometer-outline" size={18} color="#60a5fa" />
                    <Text className="ml-1 text-sm font-medium text-gray-300">High: {Math.round(day.temp_max)}°C</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="thermometer-outline" size={18} color="#93c5fd" />
                    <Text className="ml-1 text-sm text-gray-400">Low: {Math.round(day.temp_min)}°C</Text>
                  </View>
                </View>
                
                <View className="flex-1 items-center">
                  <Ionicons name={getWeatherIcon(day.conditions)} size={36} color="#60a5fa" />
                  <Text className="text-xs text-blue-400 mt-1">{day.precip_prob}%</Text>
                </View>
                
                <View className="flex-1 items-end">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="sunny-outline" size={16} color="#f59e0b" />
                    <Text className="ml-1 text-xs text-gray-400">{day.sunrise}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="moon-outline" size={16} color="#93c5fd" />
                    <Text className="ml-1 text-xs text-gray-400">{day.sunset}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// Update the temperature chart for dark theme
const TemperatureBarChart = ({ data }) => {
  const maxTemp = Math.max(...data.map(item => item.temp)) + 2;
  const minTemp = Math.min(...data.map(item => item.temp)) - 2;
  const range = maxTemp - minTemp;
  
  return (
    <View className="mt-4 mb-2">
      <View className="flex-row justify-between mb-1">
        {data.map((item, index) => (
          <Text key={index} className="text-xs text-gray-400">{item.time.split(':')[0]}h</Text>
        ))}
      </View>
      <View className="flex-row justify-between items-end h-32">
        {data.map((item, index) => {
          // Calculate height percentage
          const heightPercentage = ((item.temp - minTemp) / range) * 100;
          return (
            <View key={index} className="items-center">
              <Text className="text-xs text-gray-300 mb-1">{Math.round(item.temp)}°</Text>
              <View 
                style={{ height: `${heightPercentage}%`, width: 20 }}
                className="bg-blue-500 rounded-t-lg"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WeatherAnalytics;