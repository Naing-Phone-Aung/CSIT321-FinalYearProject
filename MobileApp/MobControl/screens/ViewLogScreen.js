import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogs } from '../context/LogContext';
import { useSettings } from '../context/SettingsContext'; 

const LogEntry = ({ item, config }) => {
  const logStyle = config[item.type] || config.normal;

  return (
    <View style={[styles.logCard, { backgroundColor: logStyle.color }]}>
      <Ionicons name={logStyle.icon} size={24} color={logStyle.iconColor} style={styles.logIcon} />
      <View style={styles.logTextContainer}>
        <Text style={[styles.logTitle, { color: logStyle.titleColor }]}>{item.title}</Text>
        <Text style={[styles.logMessage, { color: logStyle.messageColor }]}>{item.message}</Text>
      </View>
    </View>
  );
};

export default function ViewLogScreen({ navigation }) {
  const { logs } = useLogs();
  const { theme, themeMode } = useSettings(); 

  const logConfig = {
    error: {
      color: theme.colors.destructiveBackground,
      icon: 'close-circle',
      iconColor: '#D93444',
      titleColor: '#D93444',
      messageColor: themeMode === 'dark' ? '#FADBDC' : '#A93226',
    },
    warn: {
      color: themeMode === 'dark' ? '#5E4E23' : '#FFF3D8',
      icon: 'warning',
      iconColor: '#FFA900',
      titleColor: '#FFA900',
      messageColor: themeMode === 'dark' ? '#FFEBC6' : '#E69500',
    },
    normal: {
      color: theme.colors.connected,
      icon: 'checkmark-circle',
      iconColor: theme.colors.connectedText,
      titleColor: theme.colors.connectedText,
      messageColor: theme.colors.connectedText,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.titleContainer}>
        <View style={[styles.bugIconContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="bug" size={32} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>View Log</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Below are the recorded error logs for system monitoring and debugging purposes. Each entry includes the error type, and a brief description to help identify and resolve issues.
        </Text>
      </View>

      <FlatList
        inverted
        data={logs}
        // Pass the dynamic config to each LogEntry
        renderItem={({ item }) => <LogEntry item={item} config={logConfig} />}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No logs recorded yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  bugIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  logIcon: {
    marginRight: 15,
  },
  logTextContainer: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});