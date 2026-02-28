import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: If you are testing on a physical Android device or Android Emulator, 
// 'localhost' won't work because the phone thinks 'localhost' is the phone itself!
// You will need to replace this with your computer's local IP address (e.g., 'http://192.168.1.X:5000/api')
// For iOS simulator, 'http://localhost:5000/api' usually works fine.

const API = axios.create({
  baseURL: 'http://192.168.1.4:5000/api', 
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
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