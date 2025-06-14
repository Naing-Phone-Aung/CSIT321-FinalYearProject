// App.js

import React, { useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// --- We ONLY need to import the TOP-LEVEL navigator ---
import RootNav from './navigation/RootNav'; 
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider, useSettings } from './context/SettingsContext';

SplashScreen.preventAutoHideAsync();

// --- THIS IS THE CORRECTED AppContent COMPONENT ---
const AppContent = ({ onLayout }) => {
  const { theme, themeMode } = useSettings();

  return (
    <NavigationContainer theme={theme} onReady={onLayout}>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      
      {/* We only render the RootNav. It handles showing the tabs or the gamepad. */}
      <RootNav />

      {/* The extra BottomTabNavigator has been REMOVED from here. */}
    </NavigationContainer>
  );
};


// The rest of your App.js file remains the same
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Doto Thin': require('./assets/fonts/Doto.ttf'),
  });

  useEffect(() => {
    if (fontError) console.error('FONT LOADING ERROR:', fontError);
  }, [fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (fontError) {
    // Return error view if fonts fail to load
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onLayout={onLayoutRootView}>
        <Text>Error loading fonts. Please restart the app.</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <AppContent onLayout={onLayoutRootView} />
    </SettingsProvider>
  );
} 