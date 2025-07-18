import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNav from './navigation/RootNav'; 
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ConnectionProvider } from './context/useConnection'; 

SplashScreen.preventAutoHideAsync();

// This component is helpful to access the theme from SettingsProvider
const ThemedApp = ({ onLayout }) => {
  const { theme, themeMode } = useSettings();

  return (
    // 1. NavigationContainer now wraps ConnectionProvider
    <NavigationContainer theme={theme} onReady={onLayout}>
      {/* 2. ConnectionProvider is now INSIDE and can use navigation */}
      <ConnectionProvider>
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
        <RootNav />
      </ConnectionProvider>
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Doto Thin': require('./assets/fonts/Doto.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // SettingsProvider is still the outermost provider
    <SettingsProvider>
      <ThemedApp onLayout={onLayoutRootView} />
    </SettingsProvider>
  );
}