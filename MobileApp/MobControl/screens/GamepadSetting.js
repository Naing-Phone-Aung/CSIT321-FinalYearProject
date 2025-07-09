// screens/GamepadSetting.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator  } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import LayoutPreview from '../components/LayoutPreview';

const window = Dimensions.get('window');
const previewHeight = window.height * 0.8;

export default function GamepadSettingScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useSettings();
  const { layout } = route.params; 

  const [previewSize, setPreviewSize] = useState(null);

  useEffect(() => {
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.menuBar, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.rectButton} onPress={() => console.log('Move')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Move</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rectButton} onPress={() => console.log('Size')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Size</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rectButton} onPress={() => console.log('Opacity')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Opacity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rectButton} onPress={() => console.log('Mapping')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Mapping</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rectButton} onPress={() => console.log('Reset')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rectButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>
      </View>

    {/* Layout Preview */}
      <View style={styles.layoutPreviewWrapper}>
        <View
          style={styles.layoutPreviewContainer}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (!previewSize || previewSize.width !== width || previewSize.height !== height) {
              setPreviewSize({ width, height });
            }
          }}
        >
          {previewSize && (
            <LayoutPreview layout={layout} size={previewSize} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  //contentContainer: { padding: 20 },
  
  menuBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },

  rectButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  headerTitle: { 
    fontSize: 24, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  
  previewWrapper: {
    width: '100%',
    backgroundColor: '#3E3E3E', 
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  layoutPreviewWrapper: { marginBottom: 30, paddingHorizontal: 10 },
  layoutPreviewContainer: { 
    width: '70%',
    aspectRatio: 16 / 9, 
    alignSelf: 'center', 
    marginTop: 10, 
  },
});