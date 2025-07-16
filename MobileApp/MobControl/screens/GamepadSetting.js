import React, { useState, useEffect } from 'react'; // Removed useRef, it's not needed now
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native'; // Added Alert
import DraggableLayoutPreview from '../components/DraggableLayoutPreview';
import LayoutPreview from '../components/LayoutPreview';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { loadLayouts, saveLayouts } from '../services/LayoutService';

const MENU_ITEMS = ['Move', 'Size', 'Opacity', 'Mapping', 'Reset'];

const window = Dimensions.get('window');
const deviceWidth = Math.max(window.width, window.height);
const deviceHeight = Math.min(window.width, window.height);
const deviceAspectRatio = deviceWidth / deviceHeight;

export default function GamepadSettingScreen({ route }) {
  const navigation = useNavigation();
  
  const [currentLayout, setCurrentLayout] = useState(route.params.layout);
  const [activeMenu, setActiveMenu] = useState('Move');
  const [wrapperSize, setWrapperSize] = useState(null);
  
  const [sizeValue, setSizeValue] = useState(1);
  const [opacityValue, setOpacityValue] = useState(1);

  // This is the new, correct way to save the layout on exit.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      // Prevent the user from leaving the screen immediately
      e.preventDefault(); 

      try {
        const allLayouts = await loadLayouts();
        // Use the most recent 'currentLayout' from state here
        const updatedLayouts = allLayouts.map(l =>
          l.id === currentLayout.id ? currentLayout : l
        );
        await saveLayouts(updatedLayouts);
        console.log(`Layout "${currentLayout.name}" saved successfully!`);
        
        // Now that saving is complete, allow the navigation to proceed
        navigation.dispatch(e.data.action);

      } catch (error) {
        console.error("Failed to save layout on exit:", error);
        Alert.alert(
          "Save Failed", 
          "Could not save your layout changes. Do you still want to exit?",
          [
            { text: "Stay", style: "cancel", onPress: () => {} },
            { text: "Exit Anyway", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, currentLayout]); // CRITICAL: This effect re-runs every time 'currentLayout' changes.

  const handleMenuPress = (item) => {
    setActiveMenu(item);
  };
  
  const handleButtonMove = (buttonId, newPosition) => {
    setCurrentLayout(prevLayout => {
      const updatedButtons = prevLayout.buttons.map(b => 
        b.id === buttonId ? { ...b, x: newPosition.x, y: newPosition.y } : b
      );
      return { ...prevLayout, buttons: updatedButtons };
    });
  };

  const getPreviewSize = () => {
    if (!wrapperSize) return null;
    const { width: wrapperWidth, height: wrapperHeight } = wrapperSize;
    const wrapperAspectRatio = wrapperWidth / wrapperHeight;
    let previewWidth, previewHeight;
    if (wrapperAspectRatio > deviceAspectRatio) {
      previewHeight = wrapperHeight;
      previewWidth = wrapperHeight * deviceAspectRatio;
    } else {
      previewWidth = wrapperWidth;
      previewHeight = wrapperWidth / deviceAspectRatio;
    }
    return { width: previewWidth, height: previewHeight };
  };

  const previewSize = getPreviewSize();

  const renderMenuBar = () => {
    const EditingMenu = ({ title, value, onValueChange, min, max }) => (
      <View style={styles.editingMenuBar}>
        <View style={[styles.menuButton, styles.activeMenuButton]}>
          <Text style={styles.menuButtonText}>{title}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#A0A0A0"
          thumbTintColor="#FFFFFF"
          value={value}
          onValueChange={onValueChange}
        />
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setActiveMenu('Move')}
        >
          <Text style={styles.menuButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );

    if (activeMenu === 'Size') {
      return <EditingMenu title="Size" value={sizeValue} onValueChange={setSizeValue} min={0.5} max={1.5} />;
    }
    
    if (activeMenu === 'Opacity') {
      return <EditingMenu title="Opacity" value={opacityValue} onValueChange={setOpacityValue} min={0.1} max={1.0} />;
    }

    return (
      <View style={styles.mainMenuBar}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.menuButton, activeMenu === item && styles.activeMenuButton]}
            onPress={() => handleMenuPress(item)}
          >
            <Text style={styles.menuButtonText}>{item}</Text>
          </TouchableOpacity>
        ))}
        {/* We use navigation.goBack() which will trigger our 'beforeRemove' listener */}
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
          <Text style={styles.menuButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {renderMenuBar()}
        <View 
            style={styles.previewWrapper}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                if (!wrapperSize || wrapperSize.width !== width || wrapperSize.height !== height) {
                    setWrapperSize({ width, height });
                }
            }}
        >
            {previewSize && (
              <View style={[styles.previewContainer, { width: previewSize.width, height: previewSize.height }]}>
                {activeMenu === 'Move' ? (
                  <DraggableLayoutPreview
                    layout={currentLayout}
                    size={previewSize}
                    onButtonMove={handleButtonMove}
                  />
                ) : (
                  <LayoutPreview layout={currentLayout} size={previewSize} />
                )}
              </View>
            )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E3E3E',
  },
  mainMenuBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  editingMenuBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuButton: {
    backgroundColor: '#4F4F4F',
    width: 120,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 6,
    alignItems: 'center',
  },
  activeMenuButton: {
    backgroundColor: '#6E6E6E',
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  slider: {
    width: '50%',
    height: 40,
    marginHorizontal: 6,
  },
  previewWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18, 
  },
  previewContainer: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
});