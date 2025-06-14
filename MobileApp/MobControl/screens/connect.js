// screens/connect.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { useSettings } from '../context/SettingsContext';

// --- Reusable Step Component ---
// Now receives the theme as a prop to apply colors
const ConnectionStep = ({ stepNumber, text, theme }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepIconContainer}>
      <View style={[styles.stepLine, { backgroundColor: theme.colors.separator }]} />
      <Feather name="check-circle" size={24} color={theme.colors.textSecondary} />
    </View>
    <View style={styles.stepTextContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.textSecondary }]}>STEP {stepNumber}</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text }]}>{text}</Text>
    </View>
  </View>
);

// --- Reusable PC Item Component ---
// Now receives the theme as a prop
const PCItem = ({ name, status, onConnect, onDisconnect, theme }) => {
  const isConnected = status === 'Connected, secured';
  
  // A theme-aware style for the connected item
  const connectedStyle = {
    backgroundColor: isConnected ? theme.colors.connected : theme.colors.card,
  };
  
  return (
    <View style={[styles.pcItem, connectedStyle]}>
      <View>
        <Text style={[styles.pcName, { color: theme.colors.text }]}>{name}</Text>
        <Text style={[styles.pcStatus, { color: isConnected ? '#34C759' : theme.colors.textSecondary }]}>
          {status}
        </Text>
      </View>
      <TouchableOpacity onPress={isConnected ? onDisconnect : onConnect}>
        <Text style={[styles.pcActionText, { color: theme.colors.primary }]}>
          {isConnected ? 'Disconnect' : 'Tap to Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ConnectScreen() {
  // --- Get the current theme from the global context ---
  const { theme } = useSettings();
  const [networkState, setNetworkState] = useState({ type: null, ssid: null });
  const [isWifiConnected, setIsWifiConnected] = useState(false);

  const localPCs = [
    { name: 'Naing', status: 'Connected, secured' },
    { name: 'RyanSnk', status: 'Online' },
    { name: 'Naimhaze', status: 'Online' },
  ];
  
  useEffect(() => {
    const checkPermissionsAndGetNetworkInfo = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') console.log('Location permission denied.');
      }
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsWifiConnected(state.type === 'wifi' && state.isConnected);
        setNetworkState({ type: state.type, ssid: state.type === 'wifi' ? state.details.ssid : null });
      });
      return unsubscribe;
    };
    const unsubscribePromise = checkPermissionsAndGetNetworkInfo();
    return () => { unsubscribePromise.then(unsub => unsub && unsub()); };
  }, []);

const handleConnectPress = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('App-Prefs:'); 
  } else {
    IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.WIFI_SETTINGS
    );
  }
};

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* --- Header with dynamic colors --- */}
        <View style={styles.header}>
          <View style={styles.connectionStatus}>
            {isWifiConnected ? (
              <>
                <MaterialCommunityIcons name="wifi" size={24} color={theme.colors.primary} />
                <Text style={[styles.connectionTextConnected, { color: theme.colors.primary }]}>
                  {networkState.ssid || 'Connected'}
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="wifi-off" size={24} color={theme.colors.icon} />
                <Text style={[styles.connectionText, { color: theme.colors.text }]}>Not connected</Text>
              </>
            )}
          </View>
          <TouchableOpacity style={[styles.connectButton, { backgroundColor: theme.colors.primary }]} onPress={handleConnectPress}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>

        {/* --- How to connect section with dynamic colors --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How to connect ?</Text>
            <TouchableOpacity>
              <Feather name="help-circle" size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          </View>
          <View style={styles.stepsWrapper}>
            {/* Pass theme to the step components */}
            <ConnectionStep theme={theme} stepNumber={1} text="Make sure your phone and PC are on same Wi-Fi network" />
            <ConnectionStep theme={theme} stepNumber={2} text="Download driver app on your PC and open it website link" />
            <ConnectionStep theme={theme} stepNumber={3} text="Scan the QR code shown on the PC app or click on button appear below" />
          </View>
        </View>

        {/* --- Local PC section with dynamic colors --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Local PC</Text>
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }}/>
            </View>
            <TouchableOpacity style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}>
              <MaterialIcons name="qr-code-scanner" size={16} color="#FFF" />
              <Text style={styles.scanButtonText}>Scan QR</Text>
            </TouchableOpacity>
          </View>
          {localPCs.map((pc, index) => (
            // Pass theme to the PC item component
            <PCItem
              key={index}
              name={pc.name}
              status={pc.status}
              theme={theme}
              onConnect={() => console.log(`Connecting to ${pc.name}`)}
              onDisconnect={() => console.log(`Disconnecting from ${pc.name}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles without hardcoded colors ---
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  connectionStatus: { flexDirection: 'row', alignItems: 'center' },
  connectionText: { marginLeft: 8, fontSize: 16 },
  connectionTextConnected: { marginLeft: 8, fontSize: 16, fontWeight: 'bold' },
  connectButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  connectButtonText: { color: '#FFF', fontWeight: 'bold' },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  stepsWrapper: { position: 'relative', paddingLeft: 12 },
  stepContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  stepIconContainer: { alignItems: 'center', marginRight: 16, position: 'relative' },
  stepLine: { position: 'absolute', top: 24, bottom: -20, left: 11, width: 2 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: 18, marginBottom: 4, fontFamily: 'Doto Thin' },
  stepDescription: { fontSize: 15, lineHeight: 22 },
  scanButton: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  scanButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  pcItem: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pcName: { fontSize: 16, fontWeight: 'bold' },
  pcStatus: { fontSize: 14, marginTop: 4 },
  pcActionText: { fontSize: 15, fontWeight: '500' },
});