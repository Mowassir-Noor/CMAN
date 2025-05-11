import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import axiosInstance from '../../api/axiosInstance';
import * as SecureStore from 'expo-secure-store';

const Analytics = () => {
  const [coords, setCoords] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Function to get the current location
  const getClientLocation = async () => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      // Get the current location
      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setIsLoading(false); // Stop the loading spinner
    } catch (error) {
      setError(error.message);
      setIsLoading(false); // Stop the loading spinner
    }
  };

  // Function to send location to backend
  const sendLocationToBackend = async () => {
    try {
      // Validate if coordinates exist
      if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
        Alert.alert('Error', 'Location coordinates are not available. Please try again.');
        await getClientLocation(); // Try to get location again
        return;
      }

      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // const idToken = await user.getIdToken();
      
      const idToken = await SecureStore.getItemAsync('userToken')
      console.log("ID Token:", idToken);
      // Simplify the data structure - remove the nested data property
      const requestData = {
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        idToken: idToken
      };
      
      console.log('Sending location data:', requestData);
      
      const response = await axiosInstance.put('/profile/location', 
        requestData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      Alert.alert('Success', response.data.status || 'Location updated successfully');
    } catch (error) {
      console.error('Location update error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update location';
      Alert.alert('Error', errorMessage);
      
      // If there was an error with the location data, try getting it again
      if (errorMessage.includes('location')) {
        getClientLocation();
      }
    }
  };

  // Trigger to fetch location when the component mounts
  useEffect(() => {
    getClientLocation();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-6 text-gray-800">Update Your Location</Text>

      {isLoading ? (
        <View className="items-center">
          <Text className="text-base text-gray-600 mb-4">Loading your location...</Text>
          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 rounded-2xl shadow-md mb-4"
            disabled={true}
          >
            <Text className="text-white text-base font-semibold">Please wait...</Text>
          </TouchableOpacity>
        </View>
      ) : error ? (
        <View className="items-center">
          <Text className="text-base text-red-600 mb-4 text-center">{error}</Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-2xl shadow-md active:bg-blue-700 mb-4"
            onPress={getClientLocation} // Retry fetching the location
          >
            <Text className="text-white text-base font-semibold">Retry Getting Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-3 mb-4"
            onPress={() => {
              Alert.alert(
                'Location Services Required',
                'To use this feature, please:\n\n1. Open your device settings\n2. Go to Privacy/Location Services\n3. Enable Location Services\n4. Allow this app to use your location',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') }
                ]
              );
            }}
          >
            <Text className="text-blue-600 text-base font-semibold underline">How to enable location?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="text-base text-gray-600 mb-4">
            {coords
              ? `Location found: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
              : 'Location not available'}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-2xl shadow-md active:bg-blue-700"
            onPress={sendLocationToBackend} // Send location to backend
          >
            <Text className="text-white text-base font-semibold">Send My Location</Text>
          </TouchableOpacity>

          
        </>
      )}
    </View>
  );
};

export default Analytics;
