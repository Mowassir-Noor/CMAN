import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getClientLocation, getUserCity } from '../../utils/location/locationFunc';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Location() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [selectedPlaceType, setSelectedPlaceType] = useState('cafe');
  const [errorMsg, setErrorMsg] = useState(null);
  const [defaultLocation, setDefaultLocation] = useState({
    latitude: 40.7128, // New York City coordinates as fallback
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const getLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Get location coordinates
      const res = await getClientLocation();
      if (res.success) {
        const newLocation = {
          latitude: parseFloat(res.data.latitude),
          longitude: parseFloat(res.data.longitude),
          latitudeDelta: 0.0092,
          longitudeDelta: 0.0042,
        };
        console.log("Setting location:", newLocation);
        setLocation(newLocation);
        
        // Get city information
        const cityData = await getUserCity();
        if (cityData.success) {
          setCityInfo(cityData.data);
        }
      } else {
        console.error('Error getting location:', res.error);
        setErrorMsg(res.error || 'Location services unavailable');
        // Use default location as fallback
        setLocation(defaultLocation);
      }
    } catch (error) {
      console.error('Error in location process:', error);
      setErrorMsg(error.message || 'Location error occurred');
      // Use default location as fallback
      setLocation(defaultLocation);
    } finally {
      setLoading(false);
    }
  };

  // Function to retry getting location
  const retryLocation = () => {
    setLoading(true);
    getLocation();
  };

  // Use current device location regardless of permission status
  const useDefaultLocation = () => {
    const newLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    console.log("Using default location:", newLocation);
    setLocation(newLocation);
    setCityInfo({
      city: "New York",
      country: "United States",
      formattedAddress: "New York, United States"
    });
    
    // Fetch nearby places for the default location
    fetchNearbyPlaces(newLocation.latitude, newLocation.longitude, selectedPlaceType);
    
    // Clear error message since we're proceeding with default location
    setErrorMsg(null);
  };

  const fetchNearbyPlaces = async (lat, lng, placeType = 'cafe') => {
    try {
      // Note: You'll need to use your own Google Places API key
      const apiKey = 'AIzaSyCHeFRcAEweDYb2nqDrwpWkVwQbeNTiUFs'; 
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${placeType}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        setNearbyCafes(data.results);
      } else {
        console.error(`Error fetching nearby ${placeType}:`, data.status);
      }
    } catch (error) {
      console.error(`Error fetching nearby ${placeType}:`, error);
    }
  };

  // Change the place type and fetch new places
  const changePlaceType = (type) => {
    setSelectedPlaceType(type);
    if (location) {
      fetchNearbyPlaces(location.latitude, location.longitude, type);
    }
  };

  useEffect(() => {
    // Fetch location when component mounts
    getLocation();
  }, []);

  useEffect(() => {
    // When location is updated, fetch nearby places
    if (!loading && location && location.latitude && location.longitude) {
      fetchNearbyPlaces(location.latitude, location.longitude, selectedPlaceType);
    }
  }, [loading, location]);

  // We need to handle the case when location is null properly
  const MapContent = () => {
    if (!location) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2 text-base">Getting your location...</Text>
        </View>
      );
    }

    // Helper function to get the right icon and color for place types
    const getPlaceIconDetails = (placeType) => {
      switch(placeType) {
        case 'cafe':
          return { icon: 'cafe', color: '#D2691E', component: Ionicons };
        case 'restaurant':
          return { icon: 'restaurant', color: '#FF5733', component: Ionicons };
        case 'bar':
          return { icon: 'beer', color: '#DAA520', component: Ionicons };
        case 'supermarket':
        case 'grocery_or_supermarket':
        case 'store':
          return { icon: 'shopping-cart', color: '#3CB371', component: MaterialIcons };
        case 'park':
          return { icon: 'park', color: '#228B22', component: MaterialIcons };
        case 'hotel':
        case 'lodging':
          return { icon: 'hotel', color: '#4B0082', component: MaterialIcons };
        default:
          return { icon: 'place', color: '#FF0000', component: MaterialIcons };
      }
    };

    // Create a custom marker for a specific place
    const renderCustomMarker = (place) => {
      // Determine the place type - if it's a custom point, use the selected type
      const placeType = place?.types?.[0] || selectedPlaceType;
      
      // Get icon details
      const { icon, color, component: IconComponent } = getPlaceIconDetails(placeType);
      
      return (
        <View className="bg-white p-2 rounded-full shadow-md">
          <IconComponent name={icon} size={20} color={color} />
        </View>
      );
    };

    return (
      <View className="flex-1">
        <MapView 
          className="absolute top-0 left-0 right-0 bottom-0"
          provider="google"
          style={{ flex: 1, width: '100%', height: '100%' }} 
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={location}
          region={location}
          loadingEnabled={true}
          loadingIndicatorColor="#666666"
          loadingBackgroundColor="#eeeeee"
          moveOnMarkerPress={false}
          onError={(error) => console.error("Map error:", error)}
        >
          {/* User's current location marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            description={cityInfo ? cityInfo.formattedAddress : "Your current location"}
            pinColor="blue"
          >
            <View className="bg-blue-500 p-2 rounded-full shadow-md">
              <Ionicons name="location" size={22} color="white" />
            </View>
          </Marker>
          
          {/* Nearby places markers */}
          {nearbyCafes.length > 0 ? (
            nearbyCafes.map((place, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                description={place.vicinity}
              >
                {renderCustomMarker(place)}
                <Callout tooltip>
                  <View className="w-50 bg-white rounded-lg p-3 shadow-md">
                    <Text className="text-sm font-bold mb-1">{place.name}</Text>
                    <Text className="text-xs text-gray-500 mb-1">{place.vicinity}</Text>
                    {place.rating && (
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text className="text-xs ml-1 text-gray-700">{place.rating} ({place.user_ratings_total})</Text>
                      </View>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))
          ) : (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="No nearby places found"
              description="Try changing the place type or check back later."
            >
              <View className="bg-gray-400 p-2 rounded-full shadow-md">
                <Ionicons name="alert-circle" size={20} color="white" />
              </View>
            </Marker>
          )}
        </MapView>
        
        {/* Place type selector */}
        <View className="absolute top-4 left-4 right-4 flex-row justify-between bg-white bg-opacity-90 rounded-xl p-2 shadow-md">
          <TouchableOpacity
            className={`flex-1 items-center py-2 px-1 rounded-lg ${selectedPlaceType === 'cafe' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={() => changePlaceType('cafe')}
          >
            <Ionicons name="cafe" size={24} color={selectedPlaceType === 'cafe' ? "#FFFFFF" : "#666666"} />
            <Text className={`mt-1 text-xs ${selectedPlaceType === 'cafe' ? 'text-white' : 'text-gray-600'}`}>Cafes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 items-center py-2 px-1 rounded-lg ${selectedPlaceType === 'restaurant' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={() => changePlaceType('restaurant')}
          >
            <Ionicons name="restaurant" size={24} color={selectedPlaceType === 'restaurant' ? "#FFFFFF" : "#666666"} />
            <Text className={`mt-1 text-xs ${selectedPlaceType === 'restaurant' ? 'text-white' : 'text-gray-600'}`}>Restaurants</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 items-center py-2 px-1 rounded-lg ${selectedPlaceType === 'supermarket' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={() => changePlaceType('supermarket')}
          >
            <MaterialIcons name="shopping-cart" size={24} color={selectedPlaceType === 'supermarket' ? "#FFFFFF" : "#666666"} />
            <Text className={`mt-1 text-xs ${selectedPlaceType === 'supermarket' ? 'text-white' : 'text-gray-600'}`}>Supermarkets</Text>
          </TouchableOpacity>
        </View>
        
        {/* City info panel */}
        {cityInfo && (
          <View className="absolute bottom-6 left-4 right-4 bg-white bg-opacity-90 rounded-xl p-4 items-center shadow-md">
            <Text className="text-xs text-gray-500">You are in</Text>
            <Text className="text-xl font-bold text-gray-800">{cityInfo.city || cityInfo.region}</Text>
            <Text className="text-sm text-gray-600">{cityInfo.country}</Text>
          </View>
        )}

        {/* Error message panel */}
        {errorMsg && (
          <View className="absolute top-1/4 left-4 right-4 bg-white bg-opacity-95 rounded-xl p-4 items-center shadow-md">
            <Text className="text-red-500 mb-2">{errorMsg}</Text>
            <TouchableOpacity 
              className="bg-blue-500 rounded-lg py-2 px-4 mb-3"
              onPress={retryLocation}
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Error UI Component
  const LocationErrorView = () => (
    <View className="flex-1 justify-center items-center p-5">
      <Ionicons name="location-off" size={50} color="#e74c3c" />
      <Text className="text-xl font-bold text-red-500 mt-4">Location Services Unavailable</Text>
      <Text className="text-base text-gray-600 text-center my-2 px-5">{errorMsg}</Text>
      
      <TouchableOpacity 
        className="bg-blue-500 py-3 px-10 rounded-lg mt-6"
        onPress={retryLocation}
      >
        <Text className="text-white font-bold text-base">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2 text-base">Getting your location...</Text>
        </View>
      ) : errorMsg && !location ? (
        <LocationErrorView />
      ) : (
        <MapContent />
      )}
    </View>
  );
}