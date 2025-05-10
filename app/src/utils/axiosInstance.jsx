import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://cman.onrender.com/', // replace with your actual URL
  timeout: 5000,
});

export default axiosInstance;
