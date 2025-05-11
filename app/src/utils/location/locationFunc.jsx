import * as Location from 'expo-location';

/**
 * Gets the current location of the client
//  * Object containing success status and location data or error
 */
export const getClientLocation = async () => {
  try {
    // Check if location services are enabled first
    const isEnabled = await Location.hasServicesEnabledAsync();
    if (!isEnabled) {
      console.warn('Location services are disabled');
      return { 
        success: false, 
        error: 'Location services are disabled. Please enable GPS and location permissions in your device settings.' 
      };
    }

    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return { 
        success: false, 
        error: 'Location permission denied. Please grant location permissions to use this feature.' 
      };
    }

    // Get current position with timeout and high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 15000,
      maximumAge: 10000, // Accept positions that are up to 10 seconds old
    });

    // Return location data
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
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Error retrieving location.';
    
    if (error.code === 'LOCATION_TIMEOUT') {
      errorMessage = 'Location request timed out. Please try again.';
    } else if (error.code === 'LOCATION_ACCURACY') {
      errorMessage = 'Cannot obtain accurate location. Try moving to an area with better GPS signal.';
    } else if (error.message && error.message.includes('location')) {
      errorMessage = 'Current location is unavailable. Please ensure location services are enabled in your device settings.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Gets the current city of the user based on their location coordinates
 * @returns {Promise<Object>} Object containing success status and city data or error
 */
export const getUserCity = async () => {
  try {
    // First get the user's location
    const locationResult = await getClientLocation();
    
    if (!locationResult.success) {
      return { success: false, error: locationResult.error };
    }
    
    // Use reverse geocoding to get city information
    const { latitude, longitude } = locationResult.data;
    const geocodeResult = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    // Extract city information
    if (geocodeResult && geocodeResult.length > 0) {
      const locationInfo = geocodeResult[0];
      return {
        success: true,
        data: {
          city: locationInfo.city || locationInfo.subregion,
          district: locationInfo.district,
          street: locationInfo.street,
          region: locationInfo.region,
          country: locationInfo.country,
          postalCode: locationInfo.postalCode,
          timezone: locationInfo.timezone,
          formattedAddress: `${locationInfo.city || locationInfo.subregion}, ${locationInfo.region}, ${locationInfo.country}`
        }
      };
    } else {
      return { success: false, error: 'No location information found' };
    }
  } catch (error) {
    console.error('Error getting city information:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets just the city name of the user
 * @returns {Promise<string|null>} The city name or null if not available
 */
export const getUserCityName = async () => {
  const cityInfo = await getUserCity();
  if (cityInfo.success && cityInfo.data.city) {
    return cityInfo.data.city;
  }
  return null;
};

// Uncomment and fix the import for axios if you want to use this function
// import axios from 'axios';
export const sendLocationToBackend = async (place) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = coords;

    const response = await axios.post('http://<YOUR_FLASK_SERVER>/nearby-cafes', {
      latitude,
      longitude,
      place,
    });

    console.log(response.data); // list of nearby places
    return response.data;
  } catch (error) {
    console.error('Error sending location to backend:', error.message);
    return null;
  }
};
