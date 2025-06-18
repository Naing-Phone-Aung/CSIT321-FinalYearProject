// App.js

import React, { useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNav from './navigation/RootNav'; 
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ConnectionProvider } from './context/useConnection'; 

SplashScreen.preventAutoHideAsync();

const AppContent = ({ onLayout }) => {
  const { theme, themeMode } = useSettings();

  return (
    <NavigationContainer theme={theme} onReady={onLayout}>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <RootNav />
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Doto Thin': require('./assets/fonts/Doto.ttf'),
  });

  // ... your font loading logic is perfect ...
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SettingsProvider>
      <ConnectionProvider>
        <AppContent onLayout={onLayoutRootView} />
      </ConnectionProvider>
    </SettingsProvider>
  );
} 