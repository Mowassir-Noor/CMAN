// api/axiosInstance.js
import axios from 'axios';
import { getAuthToken } from '../utils/userAuth';

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'https://cman.onrender.com', // ✅ replace with your backend URL
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in each request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token in request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
