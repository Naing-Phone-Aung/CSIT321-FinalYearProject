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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [connectedPCInfo, setConnectedPCInfo] = useState(null);
  const webSocketRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const discoverySocketRef = useRef(null);

  const addDiscoveredPC = useCallback((pc) => {
    setDiscoveredPCs(prevPCs => {
      if (prevPCs.some(p => p.address === pc.address)) {
        return prevPCs;
      }
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
    } catch(err) {
      setIsScanning(false);
    }
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

  const connectToPC = useCallback((pc) => {
    if (connectionStatus !== 'disconnected') {
      console.log(`[WS-CLIENT] Ignoring connection attempt. Status is already: ${connectionStatus}`);
      return;
    }

    console.log(`[WS-CLIENT] Attempting to connect to ${pc.name} at ${pc.address}`);
    setConnectionStatus('connecting');
    setConnectedPCInfo(pc);

    if (webSocketRef.current) {
        webSocketRef.current.close();
    }

    const ws = new WebSocket(pc.address);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS-CLIENT] Event: ONOPEN - Connection successful.");
      setConnectionStatus('connected');
      ws.send(Device.deviceName || 'Mobile Device');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ping') {
          console.log('[WS-CLIENT] Received PING from server. Responding with PONG.');
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        }
      } catch (error) {
        console.log('[WS-CLIENT] Received non-JSON message:', event.data);
      }
    };

    ws.onerror = (e) => {
      console.error(`[WS-CLIENT] Event: ONERROR - ${e.message}`);
      setConnectionStatus('disconnected');
      setConnectedPCInfo(null);
      webSocketRef.current = null;
    };

    ws.onclose = (e) => {
      console.warn(`[WS-CLIENT] Event: ONCLOSE - Code: ${e.code}, Reason: '${e.reason}'`);
      setConnectionStatus('disconnected');
      setConnectedPCInfo(null);
      webSocketRef.current = null;
    };
  }, [connectionStatus]); 

  const disconnect = useCallback(() => {
    console.log("[WS-CLIENT] User initiated disconnect command.");
    if (webSocketRef.current) {
        webSocketRef.current.close(1000, "User disconnected");
    }
    setConnectionStatus('disconnected');
    setConnectedPCInfo(null);
    webSocketRef.current = null;
  }, []);

  const sendMessage = useCallback((data) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
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
  }), [discoveredPCs, isScanning, connectionStatus, connectedPCInfo, connectToPC, disconnect, rescan, sendMessage]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};