import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
  baseURL: 'https://admin-vansaya.onrender.com/api/v1', // Update with your actual base URL
  timeout: 10000, // Set a timeout for requests
});

// Add token to request headers via interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken'); // Retrieve token from SecureStore
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to headers
    }
    return config;
  },
  (error) => Promise.reject(error) // Handle errors
);

export default axiosInstance;
