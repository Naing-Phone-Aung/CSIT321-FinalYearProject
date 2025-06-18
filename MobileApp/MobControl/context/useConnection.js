// context/useConnection.js

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState } from 'react-native';
import dgram from 'react-native-udp';
import * as Device from 'expo-device';

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
  const [discoveredPCs, setDiscoveredPCs] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [connectedPC, setConnectedPC] = useState(null);
  const webSocketRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  const addDiscoveredPC = useCallback((pc) => {
    setDiscoveredPCs(prevPCs => {
      if (prevPCs.some(p => p.address === pc.address)) return prevPCs;
      console.log(`Adding new PC to list: ${pc.name}`);
      return [...prevPCs, pc];
    });
  }, []);

  const startDiscovery = useCallback(() => {
    setIsScanning(true);
    try {
      const socket = dgram.createSocket({ type: 'udp4', reusePort: true });
      socket.on('listening', () => console.log(`UDP Discovery listening on port ${DiscoveryPort}`));
      socket.on('message', (msg) => {
        const parts = msg.toString().split('|');
        if (parts[0] === 'MOB_CONTROL_SERVER' && parts.length === 3) {
          addDiscoveredPC({ name: parts[1], address: parts[2] });
        }
      });
      socket.on('error', (err) => { console.error('UDP Discovery Error:', err); setIsScanning(false); });
      socket.bind(DiscoveryPort);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => setIsScanning(false), 4000);
      return socket;
    } catch(err) {
      console.error("Failed to create UDP socket:", err);
      setIsScanning(false);
      return null;
    }
  }, [addDiscoveredPC]);

  useEffect(() => {
    let discoverySocket = startDiscovery();
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && (!discoverySocket || discoverySocket.closed)) {
        discoverySocket = startDiscovery();
      } else if (nextAppState.match(/inactive|background/) && discoverySocket) {
        discoverySocket.close();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      if (discoverySocket) discoverySocket.close();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      subscription.remove();
    };
  }, [startDiscovery]);

  const rescan = useCallback(() => {
    setDiscoveredPCs([]);
    setIsScanning(true);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => setIsScanning(false), 4000);
  }, []);
  
  const connectToPC = useCallback((pc) => {
    addDiscoveredPC(pc); 
    
    if (webSocketRef.current) webSocketRef.current.close();
    const ws = new WebSocket(pc.address);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to ${pc.name}`);
      setConnectedPC(pc);
      ws.send(Device.deviceName || 'Mobile Device');
    };
    ws.onerror = (e) => {
      console.warn(`WebSocket warning: ${e.message}`);
      setConnectedPC(null);
    };
    ws.onclose = () => {
      console.log('WebSocket Closed');
      setConnectedPC(null);
      webSocketRef.current = null;
    };
  }, [addDiscoveredPC]);

  const disconnect = () => {
    if (webSocketRef.current) {
      webSocketRef.current.close(1000, "User disconnected");
    }
  };

  const value = useMemo(() => ({
    discoveredPCs,
    isScanning,
    connectedPC,
    connectToPC,
    disconnect,
    rescan,
  }), [discoveredPCs, isScanning, connectedPC, connectToPC, disconnect, rescan]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};