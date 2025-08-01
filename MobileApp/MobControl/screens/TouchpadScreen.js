import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useConnection } from '../context/useConnection';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';
import Animated, {
    runOnJS,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

// --- Reusable Haptic Functions ---
const triggerClickHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const triggerSelectionHaptic = () => Haptics.selectionAsync();

// --- Reusable, Animated, Themed Button Component ---
const ClickButton = ({ text, onMouseDown, onMouseUp, onMiddleClick, theme, style }) => {
    const isHeld = useSharedValue(false);
    const gesture = onMiddleClick
        ? Gesture.Tap().onStart(() => {
            'worklet';
            isHeld.value = true;
            runOnJS(triggerClickHaptic)();
            if (onMiddleClick) runOnJS(onMiddleClick)();
        }).onEnd(() => { 'worklet'; isHeld.value = false; })
        : Gesture.LongPress()
            .minDuration(1)
            .onStart(() => { 'worklet'; isHeld.value = true; runOnJS(onMouseDown)(); })
            .onEnd(() => { 'worklet'; runOnJS(onMouseUp)(); })
            .onFinalize(() => { 'worklet'; isHeld.value = false; });
    
    const animatedButtonStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(isHeld.value ? theme.colors.primary : theme.colors.card, { duration: 100 }),
        transform: [{ scale: withSpring(isHeld.value ? 0.92 : 1) }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: withTiming(isHeld.value ? '#FFF' : theme.colors.text, { duration: 100 }),
        fontWeight: '600',
        fontSize: 16,
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[style, animatedButtonStyle]}>
                <Animated.Text style={animatedTextStyle}>{text}</Animated.Text>
            </Animated.View>
        </GestureDetector>
    );
};

// --- Main Touchpad Component ---
const TouchpadScreen = () => {
    const { theme } = useSettings();
    const styles = useMemo(() => getThemedStyles(theme.colors), [theme.colors]);
    const { sendMessage } = useConnection();
    const [containerHeight, setContainerHeight] = useState(1);

    // --- Refs and Shared Values ---
    const accumulatedDx = useRef(0);
    const accumulatedDy = useRef(0);
    const animationFrameId = useRef(null);
    const isButtonHeld = useSharedValue(false);
    const lastPanX = useSharedValue(0);
    const lastPanY = useSharedValue(0);
    const lastScrollDeltaY = useSharedValue(0);
    const rightScrollTranslationY = useSharedValue(0);
    const isScrolling = useSharedValue(false);

    useEffect(() => {
        if (containerHeight > 1) {
            const indicatorHeight = 80;
            const centerPoint = (containerHeight / 2) - (indicatorHeight / 2);
            rightScrollTranslationY.value = withSpring(centerPoint);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [containerHeight]);

    // --- Handlers and Callbacks ---
    const performSendMessage = (data) => sendMessage(data);
    const handleMouseDown = (button) => {
        triggerClickHaptic();
        performSendMessage({ type: 'mouse_down', button });
        isButtonHeld.value = true;
    };
    const handleMouseUp = (button) => {
        performSendMessage({ type: 'mouse_up', button });
        isButtonHeld.value = false;
    };
    const handleMiddleClick = () => {
         performSendMessage({ type: 'mouse_click', button: 'middle' });
    };
    
    const sendBatchedMovement = useCallback(() => {
        if (accumulatedDx.current !== 0 || accumulatedDy.current !== 0) {
            performSendMessage({
                type: 'mouse_move',
                dx: accumulatedDx.current,
                dy: accumulatedDy.current,
            });
            accumulatedDx.current = 0;
            accumulatedDy.current = 0;
        }
        animationFrameId.current = null;
    }, [sendMessage]);
    
    const requestSendBatchedMovement = useCallback(() => {
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(sendBatchedMovement);
        }
    }, [sendBatchedMovement]);
    
    const accumulateMovement = useCallback((dx, dy) => {
        accumulatedDx.current += dx;
        accumulatedDy.current += dy;
        requestSendBatchedMovement();
    }, [requestSendBatchedMovement]);

    // --- Gestures ---
    const tapGesture = Gesture.Tap().maxDuration(250).onStart(() => {
        'worklet';
        if (isButtonHeld.value) return;
        runOnJS(triggerClickHaptic)();
        runOnJS(performSendMessage)({ type: 'mouse_click', button: 'left' });
    });

    const unifiedPanGesture = Gesture.Pan()
        .onUpdate((e) => {
            'worklet';
            const dx = e.translationX - lastPanX.value;
            const dy = e.translationY - lastPanY.value;
            if (isButtonHeld.value || e.numberOfPointers === 1) {
                runOnJS(accumulateMovement)(dx, dy);
            } else if (e.numberOfPointers === 2) {
                runOnJS(performSendMessage)({ type: 'mouse_scroll', dy: -(dy / 1.5) });
            }
            lastPanX.value = e.translationX;
            lastPanY.value = e.translationY;
        })
        .onEnd(() => {
            'worklet';
            runOnJS(sendBatchedMovement)();
            lastPanX.value = 0;
            lastPanY.value = 0;
        });
        
    const composedTouchpadGesture = Gesture.Race(unifiedPanGesture, tapGesture);

    const scrollTrackGesture = Gesture.Pan()
        .onBegin(() => { 'worklet'; isScrolling.value = true; })
        .onUpdate((e) => {
            'worklet';
            const indicatorHeight = 80;
            const trackHeight = containerHeight;
            const centerPoint = (trackHeight / 2) - (indicatorHeight / 2);
            const newY = centerPoint + e.translationY;
            const clampedY = Math.max(0, Math.min(newY, trackHeight - indicatorHeight));
            rightScrollTranslationY.value = clampedY;
            const dy = e.translationY - lastScrollDeltaY.value;
            runOnJS(performSendMessage)({ type: 'mouse_scroll', dy: -dy });
            if (Math.floor(Math.abs(e.translationY) / 25) !== Math.floor(Math.abs(lastScrollDeltaY.value) / 25)) {
                runOnJS(triggerSelectionHaptic)();
            }
            lastScrollDeltaY.value = e.translationY;
        })
        .onFinalize(() => {
            'worklet';
            isScrolling.value = false;
            const indicatorHeight = 80;
            const centerPoint = (containerHeight / 2) - (indicatorHeight / 2);
            rightScrollTranslationY.value = withSpring(centerPoint);
            lastScrollDeltaY.value = 0;
        });

    // --- Animated Styles ---
    const scrollIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: rightScrollTranslationY.value }],
        backgroundColor: withTiming(isScrolling.value ? theme.colors.primary : theme.colors.separator, { duration: 150 }),
    }));

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.mainContent}>
                <View style={styles.leftContainer}>
                    <GestureDetector gesture={composedTouchpadGesture}>
                        <View style={styles.touchpadArea} />
                    </GestureDetector>
                    <View style={styles.buttonContainer}>
                        <ClickButton text="Left" onMouseDown={() => handleMouseDown('left')} onMouseUp={() => handleMouseUp('left')} theme={theme} style={styles.sideButton} />
                        <ClickButton text="M" onMiddleClick={handleMiddleClick} theme={theme} style={styles.middleButton} />
                        <ClickButton text="Right" onMouseDown={() => handleMouseDown('right')} onMouseUp={() => handleMouseUp('right')} theme={theme} style={styles.sideButton} />
                    </View>
                </View>
                <GestureDetector gesture={scrollTrackGesture}>
                    <View style={styles.rightScrollContainer} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
                        <Feather name="chevron-up" size={24} color={theme.colors.textSecondary} style={styles.scrollChevron} />
                        <Animated.View style={[styles.scrollIndicator, scrollIndicatorStyle]} />
                        <Feather name="chevron-down" size={24} color={theme.colors.textSecondary} style={styles.scrollChevron} />
                    </View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
};

// This function creates the stylesheet using the provided theme colors
const getThemedStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    leftContainer: {
        flex: 1,
    },
    touchpadArea: {
        flex: 1,
        backgroundColor: colors.card,
    },
    buttonContainer: {
        height: 95, // Increased height for better spacing from bottom nav
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12, // Adjusted padding
        borderTopWidth: 1,
        borderTopColor: colors.separator,
        backgroundColor: colors.card,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sideButton: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22, // Slightly increased border radius for new height
    },
    middleButton: {
        width: 65, // Slightly larger middle button
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32.5, // Keep it a circle
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.separator,
    },
    rightScrollContainer: {
        width: 55,
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: colors.separator,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: colors.card,
    },
    scrollIndicator: {
        width: 6,
        height: 80,
        borderRadius: 3,
        position: 'absolute',
    },
    scrollChevron: {
        opacity: 0.5,
    },
});

export default TouchpadScreen;