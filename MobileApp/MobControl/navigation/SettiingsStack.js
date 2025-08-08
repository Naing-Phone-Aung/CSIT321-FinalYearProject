// navigation/SettingsStack.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/setting';
import ViewLogScreen from '../screens/ViewLogScreen';

const Stack = createStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
      />

      <Stack.Screen 
        name="ViewLog" 
        component={ViewLogScreen} 
      />
      
    </Stack.Navigator>
  );
}