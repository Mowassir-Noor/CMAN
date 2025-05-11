import * as SecureStore from 'expo-secure-store';

/**
 * Retrieves the current user's UID from secure storage
 * @returns {Promise<string|null>} The user's UID or null if not found
 */
export const getUserUID = async () => {
  try {
    const uid = await SecureStore.getItemAsync('userUID');
    return uid;
  } catch (error) {
    console.error('Error retrieving user UID:', error);
    return null;
  }
};

/**
 * Retrieves the complete user data object from secure storage
 * @returns {Promise<Object|null>} User data object or null if not found
 */
export const getUserData = async () => {
  try {
    const userData = await SecureStore.getItemAsync('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Gets the authentication token from secure storage
 * @returns {Promise<string|null>} The auth token or null if not found
 */
export const getAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Checks if a user is currently logged in
 * @returns {Promise<boolean>} True if user is logged in, false otherwise
 */
export const isUserLoggedIn = async () => {
  const uid = await getUserUID();
  return !!uid;
};

/**
 * Clears all user authentication data from secure storage
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await SecureStore.deleteItemAsync('userUID');
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
