import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // The Provider wraps the Navigator, giving all screens access to the login state
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}