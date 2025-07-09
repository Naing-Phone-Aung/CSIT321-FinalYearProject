// screens/qrscan.js

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
  const { connectToPC, connectedPC } = useConnection();
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

// Handle the scanned data
const handleBarCodeScanned = ({ data }) => {
  setScanned(true);
  const parts = data.split('|');

  if (parts[0] === 'MOB_CONTROL_SERVER' && parts.length === 3) {
    const pc = { name: parts[1], address: parts[2] };
    console.log(`Scanned valid PC from QR code: ${pc.name}`);
    connectToPC(pc);
  } else {
    Alert.alert(
      "Invalid QR Code",
      "This doesn't look like a valid MobControl QR code. Please try again.",
      [{ text: "OK", onPress: () => setScanned(false) }]
    );
  }
};

  useEffect(() => {
    if (connectedPC) {
      navigation.goBack();
    }
  }, [connectedPC, navigation]);
  
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission?.granted) {
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