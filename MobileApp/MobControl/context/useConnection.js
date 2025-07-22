//context/useConnection

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState, Alert } from 'react-native';
import dgram from 'react-native-udp';
import * as Device from 'expo-device';
import { useNavigation } from '@react-navigation/native';

const DiscoveryPort = 15000;
const ConnectionContext = createContext(null);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider = ({ children }) => {
  const navigation = useNavigation();
  const [discoveredPCs, setDiscoveredPCs] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [connectedPCInfo, setConnectedPCInfo] = useState(null);
  const webSocketRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const discoverySocketRef = useRef(null);

  const addDiscoveredPC = useCallback((pc) => {
    setDiscoveredPCs(prevPCs => {
      if (prevPCs.some(p => p.address === pc.address)) return prevPCs;
      return [...prevPCs, pc];
    });
  }, []);

  const startDiscovery = useCallback(() => {
    if (discoverySocketRef.current) return;
    setIsScanning(true);
    try {
      const socket = dgram.createSocket({ type: 'udp4', reusePort: true });
      discoverySocketRef.current = socket;
      socket.on('message', (msg) => {
        const parts = msg.toString('utf8').split('|');
        if (parts[0] === 'MOB_CONTROL_SERVER' && parts.length === 3) {
          addDiscoveredPC({ name: parts[1], address: parts[2] });
        }
      });
      socket.on('error', () => setIsScanning(false));
      socket.on('close', () => discoverySocketRef.current = null);
      socket.bind(DiscoveryPort);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => setIsScanning(false), 5000);
    } catch(err) { setIsScanning(false); }
  }, [addDiscoveredPC]);

  useEffect(() => {
    startDiscovery();
    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !discoverySocketRef.current) startDiscovery();
      else if (nextAppState.match(/inactive|background/) && discoverySocketRef.current) discoverySocketRef.current.close();
    });
    return () => {
      if (discoverySocketRef.current) discoverySocketRef.current.close();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      sub.remove();
    };
  }, [startDiscovery]);

  const rescan = useCallback(() => {
    setDiscoveredPCs([]);
    if (discoverySocketRef.current) discoverySocketRef.current.close();
    startDiscovery();
  }, [startDiscovery]);

  const verifyWithOtp = useCallback((otp) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(JSON.stringify({ type: 'otp_verify', otp }));
    } else {
        Alert.alert("Connection Error", "Could not send OTP. Please try connecting again.");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (webSocketRef.current) {
        if (webSocketRef.current.readyState === WebSocket.OPEN || webSocketRef.current.readyState === WebSocket.CONNECTING) {
            webSocketRef.current.close(1000, "User disconnected");
        }
    }
    setConnectionStatus('disconnected');
    setConnectedPCInfo(null);
    webSocketRef.current = null;
  }, []);

  // ----- THIS IS THE CORRECTED FUNCTION -----
  const connectToPC = useCallback((pc) => {
    if (connectionStatus !== 'disconnected') return;

    // The address we use for the actual WebSocket connection (may contain '/qr')
    const connectionAddress = pc.address;

    // The clean PC info object we store in state (guaranteed to NOT have '/qr')
    const pcInfoForState = {
        ...pc,
        address: pc.address.replace('/qr', ''),
    };
    
    setConnectionStatus('connecting');
    setConnectedPCInfo(pcInfoForState); // Use the clean address for UI state

    if (webSocketRef.current) webSocketRef.current.close();
    
    const ws = new WebSocket(connectionAddress); // Connect using the original address
    webSocketRef.current = ws;

    ws.onopen = () => console.log("[WS-CLIENT] Connection opened, pending verification.");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch(message.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong' }));
                break;
            case 'connection_success':
                setConnectionStatus('connected');
                ws.send(Device.deviceName || 'Mobile Device');
                navigation.navigate('Connect', { screen: 'ConnectMain' });
                break;
            case 'otp_failure':
                Alert.alert("Verification Failed", "The OTP you entered is incorrect. Please try again.");
                disconnect();
                break;
        }
      } catch (error) { console.log('[WS-CLIENT] Received non-JSON message:', event.data); }
    };

    ws.onerror = (e) => console.error(`[WS-CLIENT] Error: ${e.message}`);

    ws.onclose = (e) => {
      console.warn(`[WS-CLIENT] Closed - Code: ${e.code}, Reason: '${e.reason}'`);
      if (e.code !== 1000 && connectionStatus === 'connected') {
        Alert.alert(
          "Connection Lost", "The connection to the PC was terminated.",
          [{ text: "OK", onPress: () => navigation.navigate('Connect') }]
        );
      }
      setConnectionStatus('disconnected');
      setConnectedPCInfo(null);
      webSocketRef.current = null;
    };
  }, [connectionStatus, navigation, disconnect]);

  const sendMessage = useCallback((data) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
    }
  }, []);

  const value = useMemo(() => ({
    discoveredPCs,
    isScanning,
    connectionStatus,
    connectedPC: connectedPCInfo,
    connectToPC,
    disconnect,
    rescan,
    sendMessage,
    verifyWithOtp,
  }), [discoveredPCs, isScanning, connectionStatus, connectedPCInfo, connectToPC, disconnect, rescan, sendMessage, verifyWithOtp]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};