// services/LayoutService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mobcontroller-layouts';

export const createDefaultLayout = () => ({
  id: `layout_${Date.now()}`,
  name: 'Standard Layout',
  buttons: [
    // --- Left Side ---
    { id: 'joy_l', type: 'joystick', x: 16, y: 60, size: 38 },
    { id: 'dpad-up', type: 'dpad-up', x: 38, y: 45, size: 13 },
    { id: 'dpad-down', type: 'dpad-down', x: 38, y: 65, size: 13 },
    { id: 'dpad-left', type: 'dpad-left', x: 30, y: 55, size: 13 },
    { id: 'dpad-right', type: 'dpad-right', x: 46, y: 55, size: 13 },
    { id: 'btn_lt', type: 'shoulder', label: 'LT', x: 11, y: 15, width: 18, height: 16 },
    { id: 'btn_lb', type: 'shoulder', label: 'LB', x: 13, y: 34, width: 18, height: 16 },

    // --- Right Side ---
    { id: 'joy_r', type: 'joystick', x: 62, y: 70, size: 38 },

    { id: 'btn_y', type: 'action', label: 'Y', x: 84, y: 45, size: 12 },
    { id: 'btn_b', type: 'action', label: 'B', x: 91, y: 60, size: 12 },
    { id: 'btn_a', type: 'action', label: 'A', x: 84, y: 75, size: 12 },
    { id: 'btn_x', type: 'action', label: 'X', x: 77, y: 60, size: 12 },

    { id: 'btn_rt', type: 'shoulder', label: 'RT', x: 89, y: 15, width: 18, height: 16 },
    { id: 'btn_rb', type: 'shoulder', label: 'RB', x: 87, y: 32, width: 18, height: 16 },
    
    // --- Center Buttons ---
    { id: 'menu', type: 'menu', x: 45, y: 28, size: 9 },
    { id: 'clone', type: 'clone', x: 55, y: 28, size: 9 },
  ],
});


export const loadLayouts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) return JSON.parse(jsonValue);
    
    const defaultLayouts = [createDefaultLayout()];
    await saveLayouts(defaultLayouts);
    return defaultLayouts;
  } catch (e) {
    console.error("Failed to load layouts.", e);
    return [createDefaultLayout()];
  }
};

export const saveLayouts = async (layouts) => {
  try {
    const jsonValue = JSON.stringify(layouts);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save layouts.", e);
  }
};