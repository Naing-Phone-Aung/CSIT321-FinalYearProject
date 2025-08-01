import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home';
import SettingsScreen from '../screens/setting';
import ConnectStack from './connectStack';
import TouchpadScreen from '../screens/TouchpadScreen'; // Import the new TouchpadScreen
import { useSettings } from '../context/SettingsContext';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator(); // Create a stack navigator instance

// Define the stack of screens that will live inside the "Home" tab
const HomeStackNavigator = () => {
  const { theme } = useSettings();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }} // Hide header for the main home screen
      />
      <HomeStack.Screen
        name="Touchpad"
        component={TouchpadScreen}
        options={{
          headerShown: true, // Show header for the Touchpad screen
          title: 'Touchpad',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </HomeStack.Navigator>
  );
};

export default function BottomTabNavigator() {
  const { theme } = useSettings();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.activeIcon,
        tabBarInactiveTintColor: theme.colors.icon,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator} // Use the stack navigator component here
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Connect"
        component={ConnectStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="access-point-network" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}