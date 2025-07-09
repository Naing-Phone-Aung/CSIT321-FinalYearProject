// navigation/RootNav.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './bottomNav'; 
import GamepadScreen from '../screens/Gamepad'; 
import GamepadSettingScreen from '../screens/GamepadSetting';

const Stack = createStackNavigator();

export default function RootNav() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} /> 
      <Stack.Screen name="Gamepad" component={GamepadScreen} />
      <Stack.Screen name="GamepadSetting" component={GamepadSettingScreen} />
    </Stack.Navigator>
  );
}