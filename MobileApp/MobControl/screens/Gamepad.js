import React, { useEffect, useCallback, useRef, useState } from 'react'; // Import useState
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { useConnection } from '../context/useConnection';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native'; // Import the focus effect hook
import { loadLayouts } from '../services/LayoutService'; // Import the layout loader

const window = Dimensions.get('window');
const landscapeWidth = Math.max(window.width, window.height);
const landscapeHeight = Math.min(window.width, window.height);

// --- All the component definitions (Joystick, GameButton, etc.) remain the same ---
const Joystick = ({ style, onMove, buttonId }) => {
  const joystickSize = style.width;
  const stickSize = joystickSize * 0.55;
  const radius = joystickSize / 2;
  const stickRadius = stickSize / 2;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const x = event.x - radius;
      const y = event.y - radius;
      const distance = Math.min(Math.sqrt(x ** 2 + y ** 2), radius - stickRadius);
      const angle = Math.atan2(y, x);
      translateX.value = distance * Math.cos(angle);
      translateY.value = distance * Math.sin(angle);
      if (onMove) {
        const normalizedX = parseFloat((translateX.value / (radius - stickRadius)).toFixed(4));
        const normalizedY = parseFloat((translateY.value / (radius - stickRadius)).toFixed(4));
        runOnJS(onMove)(buttonId, { x: normalizedX, y: normalizedY });
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      if (onMove) {
        runOnJS(onMove)(buttonId, { x: 0, y: 0 });
      }
    });

  const animatedStickStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.joystickBase, style]}>
        <Animated.View style={[styles.joystickStick, { width: stickSize, height: stickSize, borderRadius: stickRadius }, animatedStickStyle]} />
      </View>
    </GestureDetector>
  );
};
const GameButton = ({ style, children, onStateChange, buttonId }) => {
  const isPressed = useSharedValue(false);
  const tapGesture = Gesture.Manual()
    .onTouchesDown(() => {
      isPressed.value = true;
      if (onStateChange) runOnJS(onStateChange)(buttonId, true);
    })
    .onTouchesUp(() => {
      isPressed.value = false;
      if (onStateChange) runOnJS(onStateChange)(buttonId, false);
    })
    .onFinalize(() => {
        if(isPressed.value) {
            isPressed.value = false;
            if (onStateChange) runOnJS(onStateChange)(buttonId, false);
        }
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed.value ? 0.9 : 1) }],
    opacity: withSpring(isPressed.value ? 0.8 : 1),
  }));
  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
const ActionButton = (props) => <GameButton {...props} style={[styles.actionButton, props.style]}><Text style={styles.buttonText}>{props.label}</Text></GameButton>;
const ShoulderButton = (props) => <GameButton {...props} style={[styles.shoulderButton, props.style]}><Text style={styles.buttonText}>{props.label}</Text></GameButton>;
const DpadButton = (props) => <GameButton {...props} style={[styles.dpadShape, props.style]}><Ionicons name={`caret-${props.direction}-outline`} size={24} color="#FFF" /></GameButton>;
const FloatingButton = (props) => <GameButton {...props} style={[styles.floatingButton, props.style]}><Feather name={props.iconName} size={20} color="#FFF" /></GameButton>;
// --- End of component definitions ---

export default function GamepadScreen({ route, navigation }) {
  // Use state for the layout so it can be refreshed
  const [activeLayout, setActiveLayout] = useState(route.params.layout);

  const { sendMessage, connectionStatus } = useConnection();
  const isConnected = connectionStatus === 'connected';
  const wasConnected = useRef(isConnected);
  const navBarTimeout = useRef(null);

  // --- THIS IS THE NEW REFRESH LOGIC ---
  useFocusEffect(
    useCallback(() => {
      const reloadLayout = async () => {
        try {
          const allLayouts = await loadLayouts();
          const freshLayout = allLayouts.find(l => l.id === activeLayout.id);
          if (freshLayout) {
            setActiveLayout(freshLayout);
            console.log("Gamepad layout reloaded to show latest changes.");
          }
        } catch (error) {
          console.error("Failed to reload gamepad layout:", error);
        }
      };
      reloadLayout();
    }, []) // Empty dependency array is correct here for useFocusEffect's callback
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    NavigationBar.setBehaviorAsync('inset-swipe');
    
    StatusBar.setHidden(true, 'none');
    NavigationBar.setVisibilityAsync('hidden');

    const subscription = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === 'visible') {
        if (navBarTimeout.current) clearTimeout(navBarTimeout.current);
        navBarTimeout.current = setTimeout(() => {
          StatusBar.setHidden(true, 'fade');
          NavigationBar.setVisibilityAsync('hidden');
        }, 2500);
      }
    });

    if (wasConnected.current && !isConnected) {
      Alert.alert("Connection Lost", "The connection to the PC was lost.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    }
    wasConnected.current = isConnected;

    return () => {
      ScreenOrientation.unlockAsync();
      StatusBar.setHidden(false, 'none');
      NavigationBar.setVisibilityAsync('visible');
      subscription.remove();
      if (navBarTimeout.current) clearTimeout(navBarTimeout.current);
    };
  }, [isConnected, navigation]);

  const handleButtonStateChange = useCallback((buttonId, isPressed) => {
    const data = { type: 'button', id: buttonId, pressed: isPressed };
    if (isConnected) sendMessage(data);
  }, [isConnected, sendMessage]);
  
  const handleJoystickMove = useCallback((joystickId, position) => {
    const data = { type: 'joystick', id: joystickId, x: position.x, y: position.y };
    if (isConnected) sendMessage(data);
  }, [isConnected, sendMessage]);

  const renderButton = (button) => {
    let width, height;
    if (button.type.startsWith('dpad-') || ['joystick', 'action', 'menu', 'clone'].includes(button.type)) {
      const diameter = (button.size / 100) * landscapeHeight;
      width = diameter;
      height = diameter;
    } else {
      width = (button.width / 100) * landscapeWidth;
      height = (button.height / 100) * landscapeHeight;
    }
    const absoluteStyle = {
      position: 'absolute',
      left: (button.x / 100) * landscapeWidth - width / 2,
      top: (button.y / 100) * landscapeHeight - height / 2,
      width,
      height,
    };
    const props = { buttonId: button.id, style: absoluteStyle, onStateChange: handleButtonStateChange, };
    switch (button.type) {
      case 'joystick': return <Joystick key={button.id} {...props} onMove={handleJoystickMove} />;
      case 'action': return <ActionButton key={button.id} {...props} label={button.label} />;
      case 'shoulder': return <ShoulderButton key={button.id} {...props} label={button.label} />;
      case 'dpad-up': return <DpadButton key={button.id} {...props} direction="up" />;
      case 'dpad-down': return <DpadButton key={button.id} {...props} direction="down" />;
      case 'dpad-left': return <DpadButton key={button.id} {...props} direction="back" />;
      case 'dpad-right': return <DpadButton key={button.id} {...props} direction="forward" />;
      case 'menu': return <FloatingButton key={button.id} {...props} iconName="menu" />;
      case 'clone': return <FloatingButton key={button.id} {...props} iconName="copy" />;
      default: return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={StyleSheet.absoluteFill}>
          {/* Use the state variable to render the buttons */}
          {activeLayout.buttons.map(renderButton)}
        </View>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerButton}>
                <MaterialCommunityIcons 
                    name={isConnected ? "wifi" : "wifi-off"} 
                    size={22} 
                    color={isConnected ? "#4CAF50" : "#F44336"}
                />
            </View>
            <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="keypad-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('GamepadSetting', {layout: activeLayout})}>
                <Ionicons name="settings-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3E3E3E' },
  headerSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  headerContainer: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: 'rgba(28, 28, 30, 0.7)', borderRadius: 20, flexDirection: 'row' },
  headerButton: { marginHorizontal: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#E5E5E7', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  actionButton: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  shoulderButton: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  joystickBase: { backgroundColor: 'rgba(82, 82, 82, 0.8)', borderRadius: 99, justifyContent: 'center', alignItems: 'center' },
  joystickStick: { backgroundColor: '#D1D1D6', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 50 },
  floatingButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99 },
  dpadShape: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
});