import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNav from './navigation/RootNav'; 
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ConnectionProvider } from './context/useConnection'; 
import { LogProvider } from './context/LogContext';

SplashScreen.preventAutoHideAsync();

const ThemedApp = ({ onLayout }) => {
  const { theme, themeMode } = useSettings();

  return (
    <NavigationContainer theme={theme} onReady={onLayout}>
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
    <SettingsProvider>
      <LogProvider>
        <ThemedApp onLayout={onLayoutRootView} />
      </LogProvider>
    </SettingsProvider>
  );
}