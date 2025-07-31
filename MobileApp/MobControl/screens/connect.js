import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { useConnection } from '../context/useConnection'; 
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location'; 
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native'; 
import OtpVerificationModal from '../components/OtpVerificationModal';

// ConnectionStatus and ConnectionStep components remain unchanged...
const ConnectionStatus = ({ theme }) => {
  const [networkState, setNetworkState] = useState({ isConnected: false, ssid: null });
  const [locationPermission, setLocationPermission] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'android') {
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          setLocationPermission(true);
          NetInfo.fetch().then(state => setNetworkState({ isConnected: state.isConnected && state.type === 'wifi', ssid: state.type === 'wifi' ? state.details.ssid : null }));
        }
      });
    }
  }, []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      let ssid = null;
      if (state.isConnected && state.type === 'wifi') {
        if (Platform.OS === 'android' && locationPermission) ssid = state.details.ssid;
      }
      setNetworkState({ isConnected: state.isConnected && state.type === 'wifi', ssid });
    });
    return () => unsubscribe();
  }, [locationPermission]);
  const handleConnectPress = () => {
    if (Platform.OS === 'ios') Linking.openURL('App-Prefs:root=WIFI');
    else IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.WIFI_SETTINGS);
  };
  const statusColor = networkState.isConnected ? theme.colors.primary : theme.colors.textSecondary;
  const statusText = networkState.isConnected ? (networkState.ssid || 'Connected') : 'Not connected';
  return (<View style={styles.statusContainer}><View style={{ flexDirection: 'row', alignItems: 'center' }}><MaterialCommunityIcons name={networkState.isConnected ? "wifi" : "wifi-off"} size={24} color={statusColor} /><Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text></View><TouchableOpacity style={[styles.connectButtonMain, { backgroundColor: theme.colors.primary }]} onPress={handleConnectPress}><Text style={styles.connectButtonText}>Connect</Text></TouchableOpacity></View>);
};
const ConnectionStep = ({ stepNumber, text, theme }) => (<View style={styles.stepContainer}><View style={[styles.stepCircle, { backgroundColor: theme.colors.card }]}><Feather name="check" size={20} color={theme.colors.primary} /></View><View style={styles.stepTextContainer}><Text style={[styles.stepTitle, { color: theme.colors.textSecondary }]}>STEP {stepNumber}</Text><Text style={[styles.stepDescription, { color: theme.colors.text }]}>{text}</Text></View></View>);


const LocalPCCard = ({ pc, connectedPC, connectionStatus, onConnect, onDisconnect, theme }) => {
  const isConnected = connectedPC?.address === pc.address && connectionStatus === 'connected';
  const cardStyle = [styles.pcCard, { backgroundColor: theme.colors.card }, isConnected && { backgroundColor: theme.colors.connected }];
  const textStyle = { color: isConnected ? theme.colors.connectedText : theme.colors.text };
  const secondaryTextStyle = { color: isConnected ? theme.colors.connectedText : theme.colors.textSecondary };
  const buttonTextStyle = { color: isConnected ? theme.colors.connectedText : theme.colors.primary };
  return (<View style={cardStyle}><View style={{ flex: 1 }}><Text style={[styles.pcName, textStyle]}>{pc.name}</Text><Text style={secondaryTextStyle}>{isConnected ? 'Connected, secured' : 'Online'}</Text></View><TouchableOpacity onPress={() => (isConnected ? onDisconnect() : onConnect(pc))}><Text style={[styles.pcConnectButton, buttonTextStyle]}>{isConnected ? 'Disconnect' : 'Tap to Connect'}</Text></TouchableOpacity></View>);
};

const SearchingCard = ({ onRefresh, isScanning, theme }) => (
  <TouchableOpacity onPress={onRefresh} disabled={isScanning} style={[styles.pcCard, styles.searchingCard, { backgroundColor: theme.colors.card }]}>
    {isScanning ? (<><ActivityIndicator color={theme.colors.primary} style={{ marginRight: 12 }} /><Text style={{ color: theme.colors.textSecondary }}>Searching for PCs...</Text></>) : (<><Feather name="refresh-cw" size={16} color={theme.colors.textSecondary} style={{ marginRight: 12 }} /><Text style={{ color: theme.colors.textSecondary }}>No PCs found. Tap to refresh.</Text></>)}
  </TouchableOpacity>
);

export default function ConnectScreen() {
  const { theme } = useSettings();
  const { discoveredPCs, connectedPC, connectionStatus, connectToPC, disconnect, rescan, isScanning, verifyWithOtp } = useConnection();
  const navigation = useNavigation();
  
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [pcToVerify, setPcToVerify] = useState(null);

  const pcsToDisplay = [...discoveredPCs];

  const isConnectedPcInList = discoveredPCs.some(
    p => p.address === connectedPC?.address
  );

  if (connectedPC && !isConnectedPcInList) {
    pcsToDisplay.unshift(connectedPC);
  }
  
  const handleAttemptConnect = (pc) => {
    setPcToVerify(pc);
    connectToPC(pc);
    setOtpModalVisible(true);
  };

  const handleOtpSubmit = (otp) => {
    if (!pcToVerify) return;
    verifyWithOtp(otp);
    setOtpModalVisible(false);
  };

  const handleModalClose = () => {
    setOtpModalVisible(false);
    if (connectedPC && connectionStatus !== 'connected') {
      disconnect();
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ConnectionStatus theme={theme} />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How to connect?</Text>
            <TouchableOpacity><Feather name="help-circle" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
          </View>
          <View style={styles.stepsWrapper}>
            <View style={[styles.stepLine, { backgroundColor: theme.colors.separator }]} />
            <ConnectionStep stepNumber={1} text="Make sure your phone and PC are on the same Wi-Fi network" theme={theme} />
            <ConnectionStep stepNumber={2} text="Download the driver app on your PC from our website" theme={theme} />
            <ConnectionStep stepNumber={3} text="Scan the QR code or use the list of PCs below" theme={theme} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Local PC</Text>            

            <TouchableOpacity 
              style={[
                styles.scanButton, 
                { backgroundColor: theme.colors.primary },
                connectionStatus !== 'disconnected' && styles.disabledButton
              ]} 
              onPress={() => navigation.navigate('QRScan')}
              disabled={connectionStatus !== 'disconnected'}
            >
              <MaterialIcons name="qr-code-scanner" size={18} color="#FFF" />
              <Text style={styles.scanButtonText}>Scan QR</Text>
            </TouchableOpacity>
          </View>
          
          {pcsToDisplay.length > 0 ? (
            pcsToDisplay.map(pc => (
              <LocalPCCard
                key={pc.address}
                pc={pc}
                onConnect={handleAttemptConnect}
                onDisconnect={disconnect}
                connectedPC={connectedPC} 
                connectionStatus={connectionStatus}
                theme={theme}
              />
            ))
          ) : (
            <SearchingCard onRefresh={rescan} isScanning={isScanning} theme={theme} />
          )}
        </View>
      </ScrollView>
      <OtpVerificationModal
        visible={isOtpModalVisible}
        onVerify={handleOtpSubmit}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  contentContainer: { paddingVertical: 10, paddingHorizontal: 20 },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
  statusText: { marginLeft: 10, fontSize: 16, fontWeight: '500' },
  scanButton: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  scanButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },

  disabledButton: {
    opacity: 0.5,
  },
  connectButtonMain: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 99 },
  connectButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  stepsWrapper: { position: 'relative', paddingLeft: 20 },
  stepLine: { position: 'absolute', left: 35, top: 15, bottom: 15, width: 2 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 20, zIndex: 1 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontFamily: 'Doto Thin', fontSize: 18, letterSpacing: 1.5, marginBottom: 4 },
  stepDescription: { fontSize: 16 },
  pcCard: { padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pcName: { fontSize: 18, fontWeight: '600', marginBottom: 2 },
  pcConnectButton: { fontSize: 16, fontWeight: 'bold' },
  searchingCard: { justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }
});