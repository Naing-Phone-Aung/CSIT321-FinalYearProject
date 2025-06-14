// context/SettingsContext.js

import React, { createContext, useState, useContext } from 'react';
import { lightNavigationTheme, darkNavigationTheme } from '../constants/Theme';

// Create the context
const SettingsContext = createContext();

// Create the Provider component
export const SettingsProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleHaptics = () => {
    setIsHapticEnabled(prevState => !prevState);
  };

  // This logic is now correct because the themes are imported
  const theme = themeMode === 'light' ? lightNavigationTheme : darkNavigationTheme;

  const value = {
    theme, // This is now the full navigation theme object
    themeMode,
    toggleTheme,
    isHapticEnabled,
    toggleHaptics,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useSettings = () => useContext(SettingsContext);