// screens/setting.js

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext'; 

const SettingsRow = ({ iconName, iconFamily, title, rightComponent, onPress }) => {
  const { theme } = useSettings(); 
  const IconComponent = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

  return (
    <TouchableOpacity onPress={onPress} style={styles.row} disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.card }]}>
        <IconComponent name={iconName} size={22} color={theme.colors.text} />
      </View>
      <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.rowRight}>{rightComponent}</View>
    </TouchableOpacity>
  );
};

// Make sure your SettingsScreen component receives the navigation prop
export default function SettingsScreen({ navigation }) {
  const {
    theme,
    themeMode,
    toggleTheme,
    isHapticEnabled,
    toggleHaptics,
  } = useSettings();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Preferences
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: theme.colors.card }]}>
          <SettingsRow
            iconName="bug-outline"
            iconFamily="Ionicons"
            title="View Log"
            // Add the onPress handler here
            onPress={() => navigation.navigate('ViewLog')} 
            rightComponent={
              <View style={styles.rowRightGroup}>
                {/* The text can be removed or kept, as per your preference */}
                <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
              </View>
            }
          />
          <View style={[styles.separator, { backgroundColor: theme.colors.separator }]} />
          <SettingsRow
            iconName="vibrate"
            iconFamily="MaterialCommunityIcons"
            title="Haptic feedback"
            rightComponent={
              <Switch
                value={isHapticEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: theme.colors.separator, true: theme.colors.primary }}
                thumbColor={'#FFF'}
                ios_backgroundColor={theme.colors.separator}
              />
            }
          />
          <View style={[styles.separator, { backgroundColor: theme.colors.separator }]} />
          <SettingsRow
            iconName="color-palette-outline"
            iconFamily="Ionicons"
            title="Theme"
            rightComponent={
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.separator, true: theme.colors.primary }}
                thumbColor={'#FFF'}
                ios_backgroundColor={theme.colors.separator}
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES (No changes needed here from your original code) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  sectionBody: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'transparent',
  },
  rowTitle: {
    fontSize: 17,
    flex: 1,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 17,
    marginRight: 4,
  },
  separator: {
    height: 1,
    marginLeft: 60, 
  },
});