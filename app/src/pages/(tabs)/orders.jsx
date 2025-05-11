import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getClientLocation } from '../../utils/location/locationFunc';

export default function order() {
  const [loading, setLoading] = React.useState(true);
  const [location, setLocation] = React.useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  
  const getLocation = async () => {
    setLoading(true);
    const res = await getClientLocation();
    if (res.success) {
      setLocation({
        latitude: res.data.latitude,
        longitude: res.data.longitude,
        latitudeDelta: 0.0092,
        longitudeDelta: 0.0042,
      });
    } else {
      console.error('Error getting location:', res.error);
    }
    setLoading(false);
  };

  const fetchNearbyCafes = async (lat, lng) => {
    try {
      // Note: You'll need to use your own Google Places API key
      const apiKey = 'AIzaSyCHeFRcAEweDYb2nqDrwpWkVwQbeNTiUFs'; 
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=cafe&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        setNearbyCafes(data.results);
      } else {
        console.error('Error fetching nearby cafes:', data.status);
      }
    } catch (error) {
      console.error('Error fetching nearby cafes:', error);
    }
  };

  useEffect(() => {
    // Fetch location when component mounts
    getLocation();
  }, []);

  useEffect(() => {
    // When location is updated, fetch nearby cafes
    if (!loading && location && location.latitude && location.longitude) {
      fetchNearbyCafes(location.latitude, location.longitude);
    }
  }, [loading, location]);

  // We need to handle the case when location is null properly
  const MapContent = () => {
    if (!location) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2">Getting your location...</Text>
        </View>
      );
    }

    return (
      <MapView 
        style={StyleSheet.absoluteFillObject} 
        provider={"google"} 
        showsUserLocation 
        showsMyLocationButton 
        region={location}
      >
        {/* User's current location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />
        
        {/* Nearby cafes markers */}
        {nearbyCafes.map((cafe, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: cafe.geometry.location.lat,
              longitude: cafe.geometry.location.lng,
            }}
            title={cafe.name}
            description={cafe.vicinity}
            pinColor="red"
          />
        ))}
      </MapView>
    );
  };

  return (
    <View className="flex-1">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2">Getting your location...</Text>
        </View>
      ) : (
        <MapContent />
      )}
    </View>
  );
}

