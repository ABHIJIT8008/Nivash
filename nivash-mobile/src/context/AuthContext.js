import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For showing a splash screen while checking memory

  // Check if the user is already logged in when the app opens
  const checkLoginStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false); // Done checking, tell the app to render
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Function to save user data to the phone
  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData); // Updates global state instantly
    } catch (error) {
      console.error('Error storing login data:', error);
    }
  };

  // Function to wipe user data from the phone
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error removing login data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};