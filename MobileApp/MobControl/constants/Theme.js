// constants/Theme.js
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const lightTheme = {
  background: '#FFFFFF',
  card: '#F6F6F6',
  text: '#1C1C1E',
  textSecondary: '#8A8A8E',
  primary: '#8532F3',
  accent: '#5856D6',
  separator: '#EFEFF4',
  connected: '#E0F8E9',
  connectedText: '#34C759',
  icon: '#8A8A8E',
  activeIcon: '#8532F3',
  destructiveBackground: '#FFEBEE',
};

export const darkTheme = {
  background: '#212121',
  card: '#2E2E2E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  primary: '#8532F3',
  accent: '#5856D6',
  separator: '#3A3A3A',
  connected: '#2A4B33', 
  connectedText: '#34C759',
  icon: '#A0A0A0',
  activeIcon: '#8532F3',
  destructiveBackground: '#5D2B2B',
};

// Create the complete, navigation-ready light theme
export const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...lightTheme, // Override with our custom colors
  },
};

// Create the complete, navigation-ready dark theme
export const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkTheme, // Override with our custom colors
  },
};