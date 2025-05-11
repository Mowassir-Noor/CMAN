import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { View, Text, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { getClientLocation, getUserCity } from '../../utils/location/locationFunc';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Location() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [selectedPlaceType, setSelectedPlaceType] = useState('cafe');
  const [errorMsg, setErrorMsg] = useState(null);
  
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
        console.log("Setting live location:", newLocation);
        setLocation(newLocation);
        
        // Get city information
        const cityData = await getUserCity();
        if (cityData.success) {
          setCityInfo(cityData.data);
        }
      } else {
        console.error('Error getting location:', res.error);
        setErrorMsg(res.error || 'Location services unavailable');
        // Don't use default location - just show the error
        setLocation(null);
        // Prompt user to enable location services
        Alert.alert(
          "Location Required",
          "This app needs your location to show nearby places. Please enable location services in your device settings.",
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    } catch (error) {
      console.error('Error in location process:', error);
      setErrorMsg(error.message || 'Location error occurred');
      // Don't use default location
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to retry getting location
  const retryLocation = () => {
    setLoading(true);
    getLocation();
  };

  const fetchNearbyPlaces = async (lat, lng, placeType = 'cafe') => {
    try {
      // Note: You'll need to use your own Google Places API key
      const apiKey = 'your_google_places_api_key'; 
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
    
    // State to track selected place
    const [selectedPlace, setSelectedPlace] = useState(null);
    
    // Function to handle marker press
    const handleMarkerPress = (place) => {
      setSelectedPlace(place);
    };
    
    // Function to open Google Maps directions
    const openDirections = (to) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=driving`;
      Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
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
            onPress={() => setSelectedPlace(null)} // Deselect any place when clicking on current location
          >
            <View className="bg-blue-500 p-2 rounded-full shadow-md">
              <Ionicons name="location" size={22} color="white" />
            </View>
          </Marker>
          
          {/* Nearby places markers */}
          {nearbyCafes.length > 0 ? (
            nearbyCafes.map((place, index) => {
              // Get icon details for this place
              const placeType = place?.types?.[0] || selectedPlaceType;
              const { icon, color, component: IconComponent } = getPlaceIconDetails(placeType);
              
              return (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                  }}
                  title={place.name}
                  description={place.vicinity}
                  onPress={() => handleMarkerPress({
                    id: place.place_id,
                    name: place.name,
                    vicinity: place.vicinity,
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    place_id: place.place_id,
                    rating: place.rating,
                    type: placeType,
                  })}
                >
                  <View className={`p-2 rounded-full shadow-md ${selectedPlace?.id === place.place_id ? 'bg-blue-500' : 'bg-white'}`}>
                    <IconComponent 
                      name={icon} 
                      size={20} 
                      color={selectedPlace?.id === place.place_id ? 'white' : color} 
                    />
                  </View>
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
              );
            })
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
        
        {/* Selected place panel */}
        {selectedPlace && (
          <View className="absolute bottom-20 left-4 right-4 bg-white bg-opacity-95 rounded-xl p-4 shadow-md">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>{selectedPlace.name}</Text>
              <TouchableOpacity onPress={() => setSelectedPlace(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-sm text-gray-600 mb-3">{selectedPlace.vicinity}</Text>
            
            {selectedPlace.rating && (
              <View className="flex-row items-center mb-3">
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text className="text-sm ml-1">{selectedPlace.rating}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              className="bg-blue-500 py-3 rounded-lg items-center flex-row justify-center"
              onPress={() => openDirections(selectedPlace)}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* City info panel - Move it up if there's a selected place */}
        {cityInfo && !selectedPlace && (
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
      <Text className="text-xl font-bold text-red-500 mt-4">Location Services Required</Text>
      <Text className="text-base text-gray-600 text-center my-2 px-5">
        This app needs access to your live location. Please enable location services in your device settings.
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        {errorMsg}
      </Text>
      
      <TouchableOpacity 
        className="bg-blue-500 py-3 px-10 rounded-lg mt-6"
        onPress={retryLocation}
      >
        <Text className="text-white font-bold text-base">Retry with Live Location</Text>
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