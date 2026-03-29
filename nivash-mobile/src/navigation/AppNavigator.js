import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

// Screens
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SecurityHomeScreen from "../screens/SecurityHomeScreen";
import HelpdeskScreen from "../screens/HelpdeskScreen";
import VisitorHistoryScreen from "../screens/VisitorHistoryScreen";
import GlobalVisitorModal from "../screens/GlobalVisitorModal";
import PollsScreen from "../screens/PollsScreen";
import DuesScreen from "../screens/DuesScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import ParcelsScreen from "../screens/ParcelsScreen";
import SecurityParcelScreen from "../screens/SecurityParcelScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- RESIDENT TAB NAVIGATOR ---
const ResidentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Helpdesk") iconName = focused ? "construct" : "construct-outline";
          else if (route.name === "Visitors") iconName = focused ? "clipboard" : "clipboard-outline";
          else if (route.name === "Polls") iconName = focused ? "stats-chart" : "stats-chart-outline";
          else if (route.name === "Dues") iconName = focused ? "card" : "card-outline";
          else if (route.name === "SOS") iconName = focused ? "warning" : "warning-outline";
          else if (route.name === "Parcels") iconName = focused ? "cube" : "cube-outline";
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "bold", color: "#333" },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ title: "NIVASH" }} />
      <Tab.Screen name="Helpdesk" component={HelpdeskScreen} options={{ title: "Helpdesk" }} />
      <Tab.Screen name="Visitors" component={VisitorHistoryScreen} options={{ title: "Visitor Log" }} />
      <Tab.Screen name="Polls" component={PollsScreen} options={{ title: "Community Polls" }} />
      <Tab.Screen name="Dues" component={DuesScreen} options={{ title: "Payments" }} />
      <Tab.Screen name="SOS" component={EmergencyScreen} options={{ title: "SOS", tabBarActiveTintColor: "#dc3545" }} />
      <Tab.Screen name="Parcels" component={ParcelsScreen} options={{ title: "Parcels" }} />
    </Tab.Navigator>
  );
};

// --- NEW: SECURITY GUARD TAB NAVIGATOR ---
const SecurityTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "GateCamera") iconName = focused ? "camera" : "camera-outline";
          else if (route.name === "GateParcels") iconName = focused ? "cube" : "cube-outline";
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
        // We hide the header here because your Security screens have their own custom headers built-in!
        headerShown: false, 
      })}
    >
      <Tab.Screen name="GateCamera" component={SecurityHomeScreen} options={{ title: "Visitors" }} />
      <Tab.Screen name="GateParcels" component={SecurityParcelScreen} options={{ title: "Parcels" }} />
    </Tab.Navigator>
  );
};

// --- MAIN APP NAVIGATOR ---
const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          user.role === "Security" ? (
            // 🚨 CHANGED: Now renders the SecurityTabs instead of just one screen!
            <Stack.Screen
              name="SecurityApp"
              component={SecurityTabs}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="ResidentApp"
              component={ResidentTabs}
              options={{ headerShown: false }}
            />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
      <GlobalVisitorModal />
    </NavigationContainer>
  );
};

export default AppNavigator;