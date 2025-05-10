import * as Location from 'expo-location';

/**
 * Gets the current location of the client
//  * Object containing success status and location data or error
 */
const getClientLocation = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return { success: false, error: 'Location permission denied' };
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    // Return location data
    // console.log('Location:', location);
    return {
      success: true,
      data: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      }
    };

  } catch (error) {
    console.error('Error getting location:', error);
    return { success: false, error: error.message };
  }
};

export default getClientLocation;