// navigation/RootNav.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './bottomNav'; 
import GamepadScreen from '../screens/Gamepad'; 

const Stack = createStackNavigator();

// I've renamed this to match the filename for clarity
export default function RootNav() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} /> 
      <Stack.Screen name="Gamepad" component={GamepadScreen} />
    </Stack.Navigator>
  );
}