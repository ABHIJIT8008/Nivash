import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // <-- ADDED THIS!
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SecurityHomeScreen from '../screens/SecurityHomeScreen';
import HelpdeskScreen from '../screens/HelpdeskScreen';
import VisitorHistoryScreen from '../screens/VisitorHistoryScreen';
import GlobalVisitorModal from '../screens/GlobalVisitorModal'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- THE RESIDENT'S BOTTOM TAB BAR ---
const ResidentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Helpdesk') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Visitors') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold', color: '#333' },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ title: 'NIVASH' }} />
      <Tab.Screen name="Helpdesk" component={HelpdeskScreen} options={{ title: 'Helpdesk' }} />
      <Tab.Screen name="Visitors" component={VisitorHistoryScreen} options={{ title: 'Visitor Log' }} />
    </Tab.Navigator>
  );
};

// --- MAIN APP NAVIGATOR ---
const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    // <-- WRAPPED EVERYTHING IN NAVIGATION CONTAINER -->
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          user.role === 'Security' ? (
            <Stack.Screen name="SecurityHome" component={SecurityHomeScreen} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="ResidentApp" component={ResidentTabs} options={{ headerShown: false }} />
          )
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
      <GlobalVisitorModal />
    </NavigationContainer>
  );
};

export default AppNavigator;