import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './bottomNav'; 
import GamepadScreen from '../screens/Gamepad'; 
import GamepadSettingScreen from '../screens/GamepadSetting';
import MappingScreen from '../screens/MappingScreen';

const Stack = createStackNavigator();

export default function RootNav() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} /> 
      <Stack.Screen name="Gamepad" component={GamepadScreen} />
      <Stack.Screen name="GamepadSetting" component={GamepadSettingScreen} />
      <Stack.Screen name="Mapping" component={MappingScreen} />
    </Stack.Navigator>
  );
}