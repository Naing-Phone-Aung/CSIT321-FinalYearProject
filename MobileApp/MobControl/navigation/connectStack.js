// navigation/ConnectStack.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ConnectScreen from '../screens/connect';
import QRScanScreen from '../screens/qrscan';

const Stack = createStackNavigator();

export default function ConnectStack() {
  return (
    <Stack.Navigator>
      {/* Screen 1: The main connect screen */}
      <Stack.Screen 
        name="ConnectMain" 
        component={ConnectScreen}
        options={{ headerShown: false }} 
      />

      {/* Screen 2: The QR scanner, accessible from the ConnectScreen */}
      <Stack.Screen 
        name="QRScan" 
        component={QRScanScreen}
        options={{
          title: 'Mob Controller Scan',
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: 'white',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}