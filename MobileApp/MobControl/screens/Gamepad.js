// screens/gamepad.js

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { useConnection } from '../context/useConnection';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import { loadLayouts } from '../services/LayoutService';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';
import { Gyroscope } from 'expo-sensors';

const window = Dimensions.get('window');
const landscapeWidth = Math.max(window.width, window.height);
const landscapeHeight = Math.min(window.width, window.height);

// --- AIM ASSIST GYRO CONSTANTS ---
const GYRO_DEADZONE = 0.02;
const SMOOTHING_FACTOR = 0.6;

// --- Components (No changes here, kept for context) ---
const Joystick = ({ style, onMove, buttonId }) => {
    const joystickSize = style.width;
    const stickSize = joystickSize * 0.55;
    const radius = joystickSize / 2;
    const stickRadius = stickSize / 2;
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const panGesture = Gesture.Pan().onUpdate((event) => { const x = event.x - radius; const y = event.y - radius; const distance = Math.min(Math.sqrt(x ** 2 + y ** 2), radius - stickRadius); const angle = Math.atan2(y, x); translateX.value = distance * Math.cos(angle); translateY.value = distance * Math.sin(angle); if (onMove) { const normalizedX = parseFloat((translateX.value / (radius - stickRadius)).toFixed(4)); const normalizedY = parseFloat((translateY.value / (radius - stickRadius)).toFixed(4)); runOnJS(onMove)(buttonId, { x: normalizedX, y: normalizedY }); } }).onEnd(() => { translateX.value = withSpring(0, { damping: 15, stiffness: 200 }); translateY.value = withSpring(0, { damping: 15, stiffness: 200 }); if (onMove) { runOnJS(onMove)(buttonId, { x: 0, y: 0 }); } });
    const animatedStickStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }, { translateY: translateY.value }] }));
    return (<GestureDetector gesture={panGesture}><View style={[styles.joystickBase, style]}><Animated.View style={[styles.joystickStick, { width: stickSize, height: stickSize, borderRadius: stickRadius }, animatedStickStyle]} /></View></GestureDetector>);
};
const GameButton = ({ style, children, onStateChange, buttonId }) => {
    const isPressed = useSharedValue(false);
    const tapGesture = Gesture.Manual().onTouchesDown(() => { isPressed.value = true; if (onStateChange) runOnJS(onStateChange)(buttonId, true); }).onTouchesUp(() => { isPressed.value = false; if (onStateChange) runOnJS(onStateChange)(buttonId, false); }).onFinalize(() => { if (isPressed.value) { isPressed.value = false; if (onStateChange) runOnJS(onStateChange)(buttonId, false); } });
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(isPressed.value ? 0.9 : 1) }], opacity: withSpring(isPressed.value ? 0.8 : 1) }));
    return (<GestureDetector gesture={tapGesture}><Animated.View style={[style, animatedStyle]}>{children}</Animated.View></GestureDetector>);
};
const ActionButton = (props) => <GameButton {...props} style={[styles.actionButton, props.style]}><Text style={styles.buttonText}>{props.label}</Text></GameButton>;
const ShoulderButton = (props) => <GameButton {...props} style={[styles.shoulderButton, props.style]}><Text style={styles.buttonText}>{props.label}</Text></GameButton>;
const DpadButton = (props) => <GameButton {...props} style={[styles.dpadShape, props.style]}><Ionicons name={`caret-${props.direction}-outline`} size={24} color="#FFF" /></GameButton>;
const FloatingButton = (props) => <GameButton {...props} style={[styles.floatingButton, props.style]}><Feather name={props.iconName} size={20} color="#FFF" /></GameButton>;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// --- GyroIndicator component for live feedback ---
const GyroIndicator = ({ sensitivity }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const indicatorRadius = 40; 

    useEffect(() => {
        Gyroscope.setUpdateInterval(16);
        const sub = Gyroscope.addListener(gyroData => {
            let x = -gyroData.z;
            let y = -gyroData.y;
            
            x = Math.abs(x) > GYRO_DEADZONE ? x : 0;
            y = Math.abs(y) > GYRO_DEADZONE ? y : 0;

            const finalX = Math.max(-1, Math.min(1, x * sensitivity * 2.5)) * indicatorRadius;
            const finalY = Math.max(-1, Math.min(1, y * sensitivity * 2.5)) * indicatorRadius;
            
            translateX.value = withTiming(finalX, { duration: 100 });
            translateY.value = withTiming(finalY, { duration: 100 });
        });

        return () => sub.remove();
    }, [sensitivity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));
};


export default function GamepadScreen({ route, navigation }) {
    const [activeLayout, setActiveLayout] = useState(route.params.layout);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isSensitivityModalVisible, setSensitivityModalVisible] = useState(false);
    const [keyboardText, setKeyboardText] = useState('');
    const [gyroOrientation, setGyroOrientation] = useState(null);
    const [sensitivity, setSensitivity] = useState(0.4);
    
    const [tempSensitivity, setTempSensitivity] = useState(sensitivity);

    const gyroSubscription = useRef(null);
    const { sendMessage, sendTextMessage, connectionStatus } = useConnection();
    const isConnected = connectionStatus === 'connected';
    const wasConnected = useRef(isConnected);
    const navBarTimeout = useRef(null);
    const lastStickX = useRef(0);
    const lastStickY = useRef(0);

    useFocusEffect(
        useCallback(() => {
            const reloadLayout = async () => {
                try {
                    const allLayouts = await loadLayouts();
                    const freshLayout = allLayouts.find(l => l.id === activeLayout.id);
                    if (freshLayout) setActiveLayout(freshLayout);
                } catch (error) { console.error("Failed to reload layout:", error); }
            };
            reloadLayout();
        }, [activeLayout.id])
    );

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        StatusBar.setHidden(true, 'none');
        let sub;
        if (Platform.OS === 'android') {
            NavigationBar.setBehaviorAsync('inset-swipe');
            NavigationBar.setVisibilityAsync('hidden');
            sub = NavigationBar.addVisibilityListener(({ visibility }) => {
                if (visibility === 'visible') {
                    if (navBarTimeout.current) clearTimeout(navBarTimeout.current);
                    navBarTimeout.current = setTimeout(() => NavigationBar.setVisibilityAsync('hidden'), 2500);
                }
            });
        }
        if (wasConnected.current && !isConnected) {
            Alert.alert("Connection Lost", "The connection to the PC was lost.", [{ text: "OK", onPress: () => navigation.goBack() }]);
        }
        wasConnected.current = isConnected;
        return () => {
            ScreenOrientation.unlockAsync();
            StatusBar.setHidden(false, 'none');
            gyroSubscription.current?.remove();
            if (Platform.OS === 'android') {
                NavigationBar.setVisibilityAsync('visible');
                sub?.remove?.();
            }
            if (navBarTimeout.current) clearTimeout(navBarTimeout.current);
        };
    }, [isConnected, navigation]);

    const { isHapticEnabled } = useSettings();

    const toggleGyro = async () => {
        if (gyroSubscription.current) {
            gyroSubscription.current.remove();
            gyroSubscription.current = null;
            setGyroOrientation(null);
            sendMessage({ type: 'gyro', x: 0, y: 0, z: 0 });
            return;
        }

        const isAvailable = await Gyroscope.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert("Gyroscope Not Available", "Your device does not support this feature.");
            return;
        }

        const orientation = await ScreenOrientation.getOrientationAsync();
        if (orientation !== ScreenOrientation.Orientation.LANDSCAPE_LEFT && orientation !== ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
            Alert.alert("Incorrect Orientation", "Please hold your device in landscape before enabling gyroscope.");
            return;
        }

        setGyroOrientation(orientation);
        Gyroscope.setUpdateInterval(16);

        gyroSubscription.current = Gyroscope.addListener(gyroData => {
            let rawHorizontal, rawVertical;
            if (orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT) {
                rawHorizontal = -gyroData.z;
                rawVertical = -gyroData.y;
            } else { 
                rawHorizontal = gyroData.z;
                rawVertical = gyroData.y;
            }
            let stickX = Math.abs(rawHorizontal) > GYRO_DEADZONE ? rawHorizontal : 0;
            let stickY = Math.abs(rawVertical) > GYRO_DEADZONE ? rawVertical : 0;
            stickX *= sensitivity * 2.5;
            stickY *= sensitivity * 2.5;
            stickX = (stickX * (1 - SMOOTHING_FACTOR)) + (lastStickX.current * SMOOTHING_FACTOR);
            stickY = (stickY * (1 - SMOOTHING_FACTOR)) + (lastStickY.current * SMOOTHING_FACTOR);
            lastStickX.current = stickX;
            lastStickY.current = stickY;
            stickX = Math.max(-1.0, Math.min(1.0, stickX));
            stickY = Math.max(-1.0, Math.min(1.0, stickY));
            sendMessage({ type: 'gyro', x: stickX, y: stickY, z: gyroData.z });
        });
    };
    
    const openSensitivityModal = () => {
        setTempSensitivity(sensitivity); 
        setSensitivityModalVisible(true);
    };

    const handleSaveSensitivity = () => {
        setSensitivity(tempSensitivity); 
        if(isHapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSensitivityModalVisible(false);
    };

    const handleCancelSensitivity = () => {
        if(isHapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSensitivityModalVisible(false); 
    };

    const handleButtonStateChange = useCallback(async (buttonId, isPressed) => {
        const mappedAction = activeLayout.mappings?.[buttonId] || buttonId;
        if (isPressed && isHapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        if (Array.isArray(mappedAction)) {
            if (isPressed) {
                for (const actionId of mappedAction) {
                    sendMessage({ type: 'button', id: actionId, pressed: true });
                    await sleep(80);
                    sendMessage({ type: 'button', id: actionId, pressed: false });
                    await sleep(50);
                }
            }
            return;
        }
        sendMessage({ type: 'button', id: mappedAction, pressed: isPressed });
    }, [isConnected, sendMessage, activeLayout.mappings, isHapticEnabled]);

    const handleJoystickMove = useCallback((joystickId, position) => {
        if (isConnected) sendMessage({ type: 'joystick', id: joystickId, x: position.x, y: position.y });
    }, [isConnected, sendMessage]);

    const handleSendText = () => {
        if (keyboardText.trim()) {
            sendTextMessage(keyboardText.trim());
            setKeyboardText('');
            setKeyboardVisible(false);
        }
    };

    const renderButton = (button) => {
        let width, height;
        if (['joystick', 'action', 'menu', 'clone'].includes(button.type) || button.type.startsWith('dpad-')) {
            const diameter = (button.size / 100) * landscapeHeight;
            width = diameter; height = diameter;
        } else {
            width = (button.width / 100) * landscapeWidth;
            height = (button.height / 100) * landscapeHeight;
        }
        const absoluteStyle = { position: 'absolute', left: (button.x / 100) * landscapeWidth - width / 2, top: (button.y / 100) * landscapeHeight - height / 2, width, height };
        const props = { buttonId: button.id, style: absoluteStyle, onStateChange: handleButtonStateChange };
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
                    {activeLayout.buttons.map(renderButton)}
                </View>
                <SafeAreaView style={styles.headerSafeArea}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.headerButton} 
                            onPress={toggleGyro}
                            onLongPress={openSensitivityModal}
                            delayLongPress={300}
                        >
                            <MaterialCommunityIcons name="axis-arrow" size={24} color={gyroOrientation ? '#8532F3' : '#FFF'} />
                        </TouchableOpacity>
                        {/* --- UI CHANGE: Keyboard Icon --- */}
                        <TouchableOpacity style={styles.headerButton} onPress={() => setKeyboardVisible(true)}>
                            <MaterialCommunityIcons name="keyboard-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('GamepadSetting', { layout: activeLayout })}>
                            <Ionicons name="settings-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <Modal
                transparent visible={isSensitivityModalVisible} animationType="fade" onRequestClose={handleCancelSensitivity}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Adjust Gyro Sensitivity</Text>
                        
                        <GyroIndicator sensitivity={tempSensitivity} />

                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Low</Text>
                            <Slider
                                style={{ flex: 1, height: 40 }}
                                minimumValue={0.1}
                                maximumValue={1.5}
                                value={tempSensitivity}
                                onValueChange={setTempSensitivity}
                                minimumTrackTintColor="#8532F3"
                                maximumTrackTintColor="#777"
                                thumbTintColor="#FFF"
                            />
                            <Text style={styles.sliderLabel}>High</Text>
                        </View>

                         <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancelSensitivity}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveSensitivity}>
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                transparent visible={isKeyboardVisible} animationType="fade" onRequestClose={() => setKeyboardVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Send Text to PC</Text>
                        <TextInput style={styles.textInput} placeholder="Enter text..." placeholderTextColor="#888" value={keyboardText} onChangeText={setKeyboardText} autoFocus onSubmitEditing={handleSendText} />
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setKeyboardVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.sendButton]} onPress={handleSendText}>
                                <Text style={styles.modalButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3E3E3E' },
    headerSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
    headerContainer: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: 'rgba(28, 28, 30, 0.85)', borderRadius: 25, flexDirection: 'row' },
    headerButton: { marginHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#E5E5E7', fontSize: 20, fontWeight: '600', textAlign: 'center' },
    actionButton: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    shoulderButton: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    joystickBase: { backgroundColor: 'rgba(82, 82, 82, 0.8)', borderRadius: 99, justifyContent: 'center', alignItems: 'center' },
    joystickStick: { backgroundColor: '#D1D1D6', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 50 },
    floatingButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99 },
    dpadShape: { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
    
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContainer: { width: '85%', maxWidth: 450, backgroundColor: '#2C2C2E', borderRadius: 14, padding: 20, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
    textInput: { backgroundColor: '#444', color: '#FFF', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    cancelButton: { backgroundColor: '#555', marginRight: 10 },
    saveButton: { backgroundColor: '#8532F3', marginLeft: 10 },
    sendButton: { backgroundColor: '#8532F3', marginLeft: 10 }, 
    modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    
    sliderContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    sliderLabel: { color: '#AAA', fontSize: 14, paddingHorizontal: 10 },
});