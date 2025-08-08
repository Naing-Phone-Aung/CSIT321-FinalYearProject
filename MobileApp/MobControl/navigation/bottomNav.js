import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home';
import SettingsScreen from '../screens/setting';
import ConnectStack from './connectStack';
import TouchpadScreen from '../screens/TouchpadScreen'; 
import { useSettings } from '../context/SettingsContext';
import SettingsStack from './SettiingsStack';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator(); 

const HomeStackNavigator = () => {
  const { theme } = useSettings();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }} 
      />
      <HomeStack.Screen
        name="Touchpad"
        component={TouchpadScreen}
        options={{
          headerShown: true, 
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
        component={HomeStackNavigator} 
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
        component={SettingsStack} 
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}