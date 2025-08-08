// context/LogContext.js

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const originalConsole = useRef({
    log: console.log,
    warn: console.warn,
    error: console.error,
  }).current;

  useEffect(() => {
    console.log = (...args) => {
      originalConsole.log(...args);
      setLogs(prevLogs => [
        { 
          type: 'normal', 
          title: 'Log', 
          message: args.map(arg => JSON.stringify(arg)).join(' '),
          timestamp: new Date().toISOString()
        }, 
        ...prevLogs
      ]);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      setLogs(prevLogs => [
        { 
          type: 'warn', 
          title: 'Warning', 
          message: args.map(arg => JSON.stringify(arg)).join(' '),
          timestamp: new Date().toISOString()
        }, 
        ...prevLogs
      ]);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      setLogs(prevLogs => [
        { 
          type: 'error', 
          title: 'Error', 
          message: args.map(arg => JSON.stringify(arg)).join(' '),
          timestamp: new Date().toISOString()
        }, 
        ...prevLogs
      ]);
    };

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [originalConsole]); 

  return (
    <LogContext.Provider value={{ logs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);