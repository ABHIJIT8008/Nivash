import axios from 'axios';

// Create an instance of axios with a custom config
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to our Node backend
});

// Add an interceptor to inject the JWT token into the headers of every request
API.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('adminToken');
    
    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;