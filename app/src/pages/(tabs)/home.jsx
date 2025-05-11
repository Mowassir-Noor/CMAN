import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, SafeAreaView, ActivityIndicator, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { getClientLocation } from '../../utils/location/locationFunc'
import { getAuthToken, getUserUID } from '../../utils/userAuth'
import axiosInstance from '../../../src/api/axiosInstance'

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
      const location = await getClientLocation();
      const API_KEY = '8a993a23f3f549e4ae7205037232310';
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
  
  const renderWeatherInfo = () => {
    if (!weatherData) return null;
    
    return (
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
      <View className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md mb-3 border border-gray-800">
        {/* Only show image if one is available */}
        {/* Make the entire card tappable for a better user experience */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={openDirections}
          className="w-full"
        >
          <Image 
            source={{ uri: imageUrl }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="absolute top-0 right-0 bg-black/70 px-2 py-1 m-3 rounded-lg">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text className="ml-1 text-white font-bold">{rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View className="p-4">
          <Text className="text-xl font-bold text-white mb-1">{cafe.name}</Text>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={18} color="#60a5fa" />
            <Text className="text-gray-300 ml-1 flex-1">{cafe.address}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="navigate-circle-outline" size={18} color="#60a5fa" />
              <Text className="text-blue-400 font-medium ml-1">
                {formatDistance(cafe.distance_meters)}
              </Text>
            </View>
            
            {/* Updated directions button with hitSlop for easier tapping */}
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
              onPress={openDirections}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="navigate" size={18} color="white" />
              <Text className="text-white font-medium ml-1">Directions</Text>
            </TouchableOpacity>
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
        {renderWeatherInfo()}
        
        <View className="flex-row justify-between items-center px-5 mt-6 mb-2">
          <Text className="text-xl font-bold text-white">Today's Overview</Text>
          <TouchableOpacity className="bg-gray-800 px-3 py-1 rounded-full">
            <Text className="text-blue-400">See All</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row px-4 mb-3">
          <StatCard 
            icon={<MaterialCommunityIcons name="cart-outline" size={24} color="#4f46e5" />}
            title="Sales"
            value={todayStats.salesCount}
            color="border-indigo-600"
            bgColor="bg-indigo-100"
          />
          <StatCard 
            icon={<MaterialCommunityIcons name="currency-usd" size={24} color="#059669" />}
            title="Revenue"
            value={`$${todayStats.revenue.toLocaleString()}`}
            color="border-emerald-600"
            bgColor="bg-emerald-100"
          />
        </View>
        
        <View className="flex-row px-4 mb-4">
          <StatCard 
            icon={<Ionicons name="people-outline" size={24} color="#ea580c" />}
            title="New Customers"
            value={todayStats.newCustomers}
            color="border-orange-600"
            bgColor="bg-orange-100"
          />
          <StatCard 
            icon={<MaterialCommunityIcons name="clock-outline" size={24} color="#dc2626" />}
            title="Pending Orders"
            value={todayStats.pendingOrders}
            color="border-red-600"
            bgColor="bg-red-100"
          />
        </View>
        
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