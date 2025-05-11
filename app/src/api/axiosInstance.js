// api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://cman.onrender.com', // ✅ replace with your backend URL
  timeout: 1000,


});

export default axiosInstance;
