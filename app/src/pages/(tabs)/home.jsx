import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, SafeAreaView, ActivityIndicator, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { getClientLocation } from '../../utils/location/locationFunc'
import { getAuthToken, getUserUID } from '../../utils/userAuth'
import axiosInstance from '../../../src/api/axiosInstance'
import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window');

const Home = () => {
  const [userInfo, setUserInfo] = useState({
    uid: null,
    token: null,
    name: 'Admin User'
  });
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [todayStats, setTodayStats] = useState({
    salesCount: 157,
    revenue: 12580,
    newCustomers: 24,
    pendingOrders: 8
  });
  
  // Load user info when component mounts
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchUserInfo();
      await fetchWeatherData();
      await fetchNearbyCafes();
      setLoading(false);
    };
    
    initialize();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const uid = await getUserUID();
      const token = await getAuthToken();
      
      // You would typically fetch the user's name from your user database
      // This is a placeholder - replace with actual API call to get user data
      const userName = "John Doe"; // Example name - replace with actual fetched name
      
      setUserInfo({
        uid: uid,
        token: token,
        name: userName
      });
      
      console.log("User UID:", uid);
      console.log("Auth Token:", token);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  
  const fetchWeatherData = async () => {
    try {
      // First try to get weather from our backend API if user is authenticated
      const uid = await getUserUID();
      
      if (uid) {
        try {
          // Use our backend API which connects to Visual Crossing
          const response = await axiosInstance.get(`/weather/current/${uid}`);
          
          if (response.data) {
            // Transform the backend response to match our expected format
            const apiData = response.data;
            
            // Create a compatible weatherData object 
            const weatherDataFromApi = {
              name: apiData.location,
              main: {
                temp: apiData.temp,
                feels_like: apiData.feels_like,
                humidity: apiData.humidity,
                // Estimate min/max from current temperature
                temp_min: apiData.temp - 2,
                temp_max: apiData.temp + 3
              },
              weather: [
                {
                  main: apiData.conditions,
                  description: apiData.conditions,
                  // Set a default icon or derive from conditions
                  icon: getWeatherIconCode(apiData.conditions)
                }
              ],
              wind: {
                speed: 5.0, // Default value as it might not be in the response
              },
              sys: {
                sunrise: Math.floor(new Date().setHours(6, 30, 0) / 1000),
                sunset: Math.floor(new Date().setHours(18, 30, 0) / 1000)
              }
            };
            
            setWeatherData(weatherDataFromApi);
            return;
          }
        } catch (apiError) {
          console.error('Error fetching from backend API:', apiError);
          // Fall back to OpenWeather API
        }
      }
      
      // Fallback to OpenWeather API if backend call fails or user is not authenticated
      const location = await getClientLocation();
      const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeather API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };
  
  // Helper function to get weather icon code based on conditions
  const getWeatherIconCode = (condition) => {
    if (!condition) return '01d'; // default clear day
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('rain')) return '10d';
    if (conditionLower.includes('shower')) return '09d';
    if (conditionLower.includes('snow')) return '13d';
    if (conditionLower.includes('thunder')) return '11d';
    if (conditionLower.includes('drizzle')) return '09d';
    if (conditionLower.includes('cloud')) return '03d';
    if (conditionLower.includes('overcast')) return '04d';
    if (conditionLower.includes('clear')) return '01d';
    if (conditionLower.includes('sunny')) return '01d';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '50d';
    
    return '01d'; // Default to clear day if no match
  };

  const sendlocation = () => {
    
    getClientLocation()
      .then((res) => {
        
      
      })
      .catch((err) => {
        console.log('error', err)
      })
  }

  const getIdToken = async () => {
    try {
      const token = await getAuthToken();
      const uid = await getUserUID();
      
      console.log("Auth Token:", token);
      console.log("User UID:", uid);
      
      // Update state with the latest values
      setUserInfo({
        uid: uid,
        token: token
      });
    } catch (error) {
      console.error("Error getting token:", error);
    }
  }
  
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

  // Generate hourly forecast data from current weather data
  const generateHourlyForecast = () => {
    if (!weatherData) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Create 6 hour forecast based on current temperature with slight variations
    return Array(6).fill(0).map((_, index) => {
      const hour = (currentHour + index * 4) % 24;
      const hourTemp = weatherData.main.temp + (Math.random() * 4 - 2); // Random variation of +/- 2 degrees
      
      return {
        hour,
        temp: hourTemp,
        conditions: index < 3 ? weatherData.weather[0].main : "Clear" // Simplified condition change for later hours
      };
    });
  };
  
  // Enhanced weather info rendering
  const renderWeatherInfo = () => {
    if (!weatherData) return null;
    
    const hourlyData = generateHourlyForecast();
    
    return (
      <View>
        <View className="bg-gradient-to-br from-blue-800 to-indigo-900 mx-4 my-2 rounded-2xl p-4 shadow-lg border border-blue-900">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-4xl font-bold text-white">{Math.round(weatherData.main.temp)}°C</Text>
              <Text className="text-white text-lg capitalize">{weatherData.weather[0].description}</Text>
              <Text className="text-white/80 text-base mt-1">{weatherData.name}</Text>
            </View>
            <View className="bg-white/20 rounded-full p-2">
              <Image 
                source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png` }}
                className="w-24 h-24"
              />
            </View>
          </View>
          
          <View className="flex-row justify-between mt-4 pt-3 border-t border-white/30">
            <View className="flex-row items-center">
              <Ionicons name="water-outline" size={18} color="white" />
              <Text className="text-white ml-2">Humidity: {weatherData.main.humidity}%</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome5 name="wind" size={18} color="white" />
              <Text className="text-white ml-2">{weatherData.wind.speed} m/s</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="weather-sunset-up" size={18} color="white" />
              <Text className="text-white ml-2">
                {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Hourly forecast section from analytics page */}
        <View className="mx-4 bg-gray-800 rounded-xl p-4 shadow-lg mb-4 border border-gray-700">
          <Text className="text-base font-medium text-gray-200 mb-3">Temperature Trend Today</Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-200">Temperature Range</Text>
            <View className="flex-row items-center">
              <Ionicons name="thermometer-outline" size={16} color="#60a5fa" />
              <Text className="text-blue-400 ml-1">
                {Math.round(Math.min(...hourlyData.map(h => h.temp)))}° - 
                {Math.round(Math.max(...hourlyData.map(h => h.temp)))}°C
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <View className={`flex-1 rounded-xl p-4 mx-1 shadow bg-gray-800 border-l-4 ${color}`}>
      <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${bgColor}`}>
        {icon}
      </View>
      <Text className="text-xl font-bold text-white">{value}</Text>
      <Text className="text-gray-400">{title}</Text>
    </View>
  );
  
  const CafeCard = ({ cafe }) => {
    // Format distance to show in km with proper formatting
    const formatDistance = (meters) => {
      if (meters < 1000) {
        return `${meters.toFixed(0)} m`;
      } else {
        return `${(meters / 1000).toFixed(1)} km`;
      }
    };
    
    // Open Google Maps with directions - completely revised for better reliability
    const openDirections = () => {
      try {
        console.log("Opening directions for:", cafe.name);
        
        // Use coordinates directly if available - most reliable method
        if (cafe.coordinates || (cafe.lat && cafe.lng)) {
          const lat = cafe.coordinates?.lat || cafe.lat;
          const lng = cafe.coordinates?.lng || cafe.lng;
          
          if (lat && lng) {
            const coordsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            console.log("Using coordinates URL:", coordsUrl);
            Linking.openURL(coordsUrl);
            return;
          }
        }
        
        // Next try using place_id if available in the google_maps_link
        if (cafe.google_maps_link && cafe.google_maps_link.includes('place_id')) {
          // Extract place_id from the URL
          const placeIdMatch = cafe.google_maps_link.match(/place_id:([^&]+)/);
          if (placeIdMatch && placeIdMatch[1]) {
            const placeId = placeIdMatch[1];
            const placeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}&query_place_id=${placeId}`;
            console.log("Using place_id URL:", placeUrl);
            Linking.openURL(placeUrl);
            return;
          } else {
            // If we can't extract the place_id, just use the original URL
            console.log("Using original maps link");
            Linking.openURL(cafe.google_maps_link);
            return;
          }
        }
        
        // As a last resort, use the cafe name and address
        useNameAndAddress();
        
      } catch (error) {
        console.error("Error opening directions:", error);
        // Fall back to name and address
        useNameAndAddress();
      }
    };
    
    // Use cafe name and address for search
    const useNameAndAddress = () => {
      try {
        // Create a search query with both name and address for better results
        const searchQuery = `${cafe.name}, ${cafe.address}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
        
        console.log("Using search URL:", searchUrl);
        Linking.openURL(searchUrl);
      } catch (err) {
        console.error("Error creating search URL:", err);
        alert("Could not open maps. Please try again.");
      }
    };
    
    // Generate random rating for cafes if not provided
    const rating = cafe.rating || (3.5 + Math.random() * 1.5).toFixed(1);
    
    // Use a placeholder image if none is provided
    const imageUrl = cafe.image || 
      `https://source.unsplash.com/random/800x600/?cafe,coffee&sig=${cafe.name}`;
    
    return (
      <View className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md mb-2 border border-gray-800">
        <View className="flex-row">
          {/* Smaller image on the left */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={openDirections}
            className="w-1/3"
          >
            <Image 
              source={{ uri: imageUrl }}
              className="w-full h-28"
              resizeMode="cover"
            />
            <View className="absolute top-0 right-0 bg-black/70 px-1.5 py-0.5 m-1 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#FFC107" />
                <Text className="ml-0.5 text-white font-bold text-xs">{rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Cafe details on the right */}
          <View className="p-2 flex-1">
            <Text className="text-base font-bold text-white">{cafe.name}</Text>
            
            <View className="flex-row items-center mb-1 mt-1">
              <Ionicons name="location-outline" size={14} color="#60a5fa" />
              <Text className="text-gray-300 ml-1 flex-1 text-xs" numberOfLines={2}>
                {cafe.address}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mt-auto">
              <View className="flex-row items-center">
                <Ionicons name="navigate-circle-outline" size={14} color="#60a5fa" />
                <Text className="text-blue-400 font-medium ml-0.5 text-xs">
                  {formatDistance(cafe.distance_meters)}
                </Text>
              </View>
              
              {/* Smaller directions button */}
              <TouchableOpacity 
                className="bg-blue-600 px-2 py-1 rounded-full flex-row items-center"
                onPress={openDirections}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="navigate" size={12} color="white" />
                <Text className="text-white font-medium ml-1 text-xs">Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const fetchNearbyCafes = async () => {
    try {
      // Set loading state specifically for cafes section
      setLoading(true);
      
      // Attempt to get location with better error handling
      let location;
      try {
        location = await getClientLocation();
        if (!location || !location.coords) {
          throw new Error('Location unavailable');
        }
      } catch (locationError) {
        console.error('Location error:', locationError);
        // Use hardcoded coordinates as fallback
        location = {
          coords: {
            latitude: 39.96939957261083,
            longitude: 32.744049317303556
          }
        };
        console.log('Using fallback coordinates');
      }
      
      const { latitude, longitude } = location.coords;
      console.log(`Fetching cafes at: Lat ${latitude}, Lon ${longitude}`);
      
      // Use direct fetch with more detailed error logging
      try {
        const response = await fetch(`https://cman.onrender.com/cafes/top5?lat=${latitude}&lon=${longitude}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Cafe API response:', data);
        
        // Set cafe data directly without transforming, since the API already provides
        // the correct format with address, distance_meters, etc.
        if (Array.isArray(data)) {
          setNearbyCafes(data);
          console.log(`Processed ${data.length} cafes`);
        } else {
          console.warn('API did not return an array');
          setNearbyCafes([]);
        }
      } catch (apiError) {
        console.error('API request failed:', apiError);
        setNearbyCafes([]);
      }
    } catch (error) {
      console.error('Unexpected error in fetchNearbyCafes:', error);
      setNearbyCafes([]);
    } finally {
      setLoading(false);
    }
  };

  // Create more detailed weather data based on current weather
  const createDetailedWeatherData = () => {
    if (!weatherData) return null;
    
    // Current hour
    const now = new Date();
    const currentHour = now.getHours();
    
    // Create hourly forecast with temperature variations
    const hourly = Array(24).fill(0).map((_, i) => {
      const hour = (currentHour + i) % 24;
      // Create a realistic temperature curve peaking in the afternoon
      const hourFactor = 1 - Math.abs((hour - 14) / 14); // peak at 2PM (hour 14)
      const baseTemp = weatherData.main.temp;
      const tempVariation = Math.sin(i/24 * Math.PI * 2) * 3;
      const hourTemp = baseTemp + tempVariation;
      
      // Determine conditions based on original weather
      let condition = weatherData.weather[0].main;
      // Vary conditions slightly for future hours to make it more realistic
      if (i > 6) {
        condition = Math.random() > 0.7 ? "Clear" : condition;
      }
      
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        temp: hourTemp,
        precip_prob: condition.toLowerCase().includes('rain') ? "60%" : 
                     condition.toLowerCase().includes('cloud') ? "30%" : "5%",
        conditions: condition
      };
    });
    
    return {
      hourly: hourly,
      current: {
        location: weatherData.name,
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        conditions: weatherData.weather[0].main
      }
    };
  };
  
  // Enhanced weather render function from analytics page
  const renderEnhancedWeather = () => {
    if (!weatherData) return null;
    
    const detailedWeather = createDetailedWeatherData();
    
    return (
      <View>
        {/* Current Weather Card */}
        <View className="mx-4 my-4 rounded-2xl overflow-hidden">
          <View className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 rounded-2xl shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#f0f9ff" />
                <Text className="text-blue-100 text-base font-medium ml-1">{weatherData.name}</Text>
              </View>
              <Text className="text-blue-200 text-sm font-light">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center my-6">
              <View>
                <Text className="text-6xl font-bold text-white">{Math.round(weatherData.main.temp)}°</Text>
                <Text className="text-base text-blue-100 opacity-90">Feels like {Math.round(weatherData.main.feels_like)}°C</Text>
                <Text className="text-lg text-white font-medium mt-1 capitalize">{weatherData.weather[0].description}</Text>
              </View>
              <View className="bg-blue-800/30 p-3 rounded-full">
                <Image 
                  source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png` }}
                  className="w-24 h-24"
                />
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4 pt-4 border-t border-blue-400/30">
              <View className="flex-row items-center">
                <Ionicons name="water-outline" size={18} color="#93c5fd" />
                <Text className="text-blue-200 ml-1">Humidity: {weatherData.main.humidity}%</Text>
              </View>
              
              <View className="flex-row items-center">
                <FontAwesome5 name="wind" size={18} color="#93c5fd" />
                <Text className="text-blue-200 ml-1">{weatherData.wind.speed} m/s</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Hourly Forecast Section */}
        <View className="mx-4 my-2 mb-4">
          <Text className="text-lg font-bold text-gray-200 mb-3">Hourly Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            {detailedWeather.hourly.slice(0, 24).map((hour, index) => (
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
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="mt-4 text-blue-400 text-base">Loading dashboard...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
        <View>
          <Text className="text-2xl font-bold text-white">Hello, {userInfo.name.split(' ')[0]}</Text>
          <Text className="text-gray-400 mt-1">Welcome to your dashboard</Text>
        </View>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-full">
          <Ionicons name="person-circle" size={36} color="#60a5fa" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderEnhancedWeather()}
        
        {/* Nearby Cafes Section */}
        <View className="flex-row justify-between items-center px-5 mt-6 mb-2">
          <Text className="text-xl font-bold text-white">Nearby Cafes</Text>
          <TouchableOpacity 
            className="bg-gray-800 px-3 py-1 rounded-full"
            onPress={fetchNearbyCafes}
          >
            <Text className="text-blue-400">Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <View className="px-4 mb-4">
          {nearbyCafes.length > 0 ? (
            nearbyCafes.map(cafe => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))
          ) : (
            <View className="bg-gray-800 rounded-xl p-6 items-center justify-center shadow-sm border border-gray-700">
              <Ionicons name="cafe-outline" size={32} color="#60a5fa" />
              <Text className="text-gray-300 mt-2 text-center">
                No cafes found nearby. Try refreshing the location.
              </Text>
            </View>
          )}
        </View>
        
        <View className="flex-row px-4 mt-1 mb-3">
          <TouchableOpacity 
            className="flex-1 mx-1 bg-blue-800 rounded-lg py-2 px-3 flex-row items-center justify-center shadow-md"
            onPress={getIdToken}
          >
            <Ionicons name="refresh" size={18} color="white" />
            <Text className="text-white font-medium ml-1.5 text-sm">Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 mx-1 bg-emerald-800 rounded-lg py-2 px-3 flex-row items-center justify-center shadow-md"
            onPress={sendlocation}
          >
            <Ionicons name="location" size={18} color="white" />
            <Text className="text-white font-medium ml-1.5 text-sm">Send Location</Text>
          </TouchableOpacity>
        </View>
        
        <View className="mx-4 mb-4 bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 border-blue-600">
          <View className="flex-row items-center mb-1.5">
            <Ionicons name="shield-checkmark" size={18} color="#60a5fa" />
            <Text className="text-base font-bold text-white ml-1.5">Authentication Info</Text>
          </View>
          <View className="bg-gray-700/70 p-2 rounded-md">
            <Text className="text-gray-300 text-xs mb-0.5">
              <Text className="font-bold">Name:</Text> {userInfo.name || 'Not available'}
            </Text>
            <Text className="text-gray-300 text-xs mb-0.5">
              <Text className="font-bold">UID:</Text> {userInfo.uid ? userInfo.uid.slice(0, 10) + '...' : 'Not available'}
            </Text>
            <Text className="text-gray-300 text-xs">
              <Text className="font-bold">Token Status:</Text>{' '}
              <Text className={userInfo.token ? 'text-emerald-400' : 'text-red-400'}>
                {userInfo.token ? 'Active' : 'Inactive'}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;