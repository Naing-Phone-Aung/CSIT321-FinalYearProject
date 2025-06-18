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

const SettingsRow = ({ iconName, iconFamily, title, rightComponent }) => {
  const { theme } = useSettings(); 
  const IconComponent = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

  return (
    <View style={styles.row}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.card }]}>
        <IconComponent name={iconName} size={22} color={theme.colors.text} />
      </View>
      <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.rowRight}>{rightComponent}</View>
    </View>
  );
};

export default function SettingsScreen() {
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
            rightComponent={
              <TouchableOpacity style={styles.rowRightGroup}>
                <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>
                  No Error
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
              </TouchableOpacity>
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

// --- UPDATED STYLES ---
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