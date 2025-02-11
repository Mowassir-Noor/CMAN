import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create Axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'https://admin-vansaya.onrender.com/api/v1', // Replace with your API's base URL
  // timeout: 10000, // Set a timeout for requests
});

// Add token to request headers via interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken'); // Retrieve token from SecureStore
    // console.log('Retrieved token:', token);  // Log the token to ensure it's being retrieved
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to headers
    }
    return config;
  },
  (error) => Promise.reject(error) // Handle errors
);

export default axiosInstance;
