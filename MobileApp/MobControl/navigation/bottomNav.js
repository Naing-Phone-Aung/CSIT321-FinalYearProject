// navigation/bottomNav.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home';
import SettingsScreen from '../screens/setting';
import ConnectStack from './connectStack'; 
import { useSettings } from '../context/SettingsContext';

const Tab = createBottomTabNavigator();

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
        component={HomeScreen}
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