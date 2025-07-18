import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useConnection } from '../context/useConnection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScannerOverlay = () => (
  <View style={styles.overlay}>
    <View style={styles.unfocusedContainer}></View>
    <View style={styles.middleContainer}>
      <View style={styles.unfocusedContainer}></View>
      <View style={styles.focusedContainer}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
      <View style={styles.unfocusedContainer}></View>
    </View>
    <View style={styles.unfocusedContainer}></View>
  </View>
);

export default function QRScanScreen() {
  const navigation = useNavigation();
  // We no longer need connectedPC here, as connectToPC will handle navigation
  const { connectToPC } = useConnection(); 
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true); // Prevent multiple scans
    const parts = data.split('|');

    if (parts[0] === 'MOB_CONTROL_SERVER' && parts.length === 3) {
      // --- THIS IS THE KEY CHANGE ---
      // Append '/qr' to the address to tell the server this is a QR scan
      const pc = { name: parts[1], address: `${parts[2]}/qr` }; 
      
      console.log(`Scanned QR. Attempting to connect to: ${pc.name} at ${pc.address}`);
      connectToPC(pc);
      // The useConnection hook will handle navigation on 'connection_success'
    } else {
      Alert.alert(
        "Invalid QR Code",
        "This QR code is not valid for MobControl. Please scan the one on your PC.",
        [{ text: "OK", onPress: () => setScanned(false) }] // Allow scanning again
      );
    }
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    } else if (!permission.granted) {
      // Handle case where permission was denied
      Alert.alert("Camera Permission", "Camera access is required to scan QR codes.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  }, [permission, requestPermission, navigation]);

  if (!permission?.granted) {
    // Render nothing or a loading/permission message while waiting
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        enableTorch={isTorchOn}
      />
      <ScannerOverlay />
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.torchButton}
          onPress={() => setIsTorchOn(current => !current)}
        >
          <MaterialCommunityIcons 
            name={isTorchOn ? "flashlight" : "flashlight-off"} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  torchButton: {
    padding: 15,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 2,
  },
  unfocusedContainer: {
    flex: 1,
  },
  focusedContainer: {
    flex: 6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'white',
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});