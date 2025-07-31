import React from 'react';
import { View, StyleSheet, Text } from 'react-native'; 
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons, Feather } from '@expo/vector-icons';

// These are the static, visual parts of the buttons.
const PreviewJoystick = ({ style }) => <View style={[styles.joystickBase, style]}><View style={[styles.joystickStick, {width: style.width * 0.55, height: style.width * 0.55, borderRadius: style.width * 0.275}]} /></View>;
const PreviewActionButton = ({ style, label }) => <View style={[styles.actionButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewShoulderButton = ({ style, label }) => <View style={[styles.shoulderButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewDpadButton = ({ style, direction }) => <View style={[styles.dpadShape, style]}><Ionicons name={`caret-${direction}-outline`} size={12} color="#FFF" /></View>;
const PreviewFloatingButton = ({ style, iconName }) => <View style={[styles.floatingButton, style]}><Feather name={iconName} size={10} color="#FFF" /></View>;

// This is a new wrapper component for a single draggable button
const DraggableButton = ({ button, previewSize, onMoveEnd }) => {
  const { width: previewWidth, height: previewHeight } = previewSize;

  // Calculate button dimensions in pixels
  let buttonWidth, buttonHeight;
  if (button.type.startsWith('dpad-') || ['joystick', 'action', 'menu', 'clone'].includes(button.type)) {
    buttonHeight = buttonWidth = (button.size / 100) * previewHeight;
  } else {
    buttonWidth = (button.width / 100) * previewWidth;
    buttonHeight = (button.height / 100) * previewHeight;
  }

  // Calculate initial pixel position based on percentage
  const initialX = (button.x / 100) * previewWidth - buttonWidth / 2;
  const initialY = (button.y / 100) * previewHeight - buttonHeight / 2;

  // Shared values for animation
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);

  const pan = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = initialX + event.translationX;
      translateY.value = initialY + event.translationY;
    })
    .onEnd((event) => {
      const finalX = initialX + event.translationX;
      const finalY = initialY + event.translationY;
      
      const newPercentX = ((finalX + buttonWidth / 2) / previewWidth) * 100;
      const newPercentY = ((finalY + buttonHeight / 2) / previewHeight) * 100;
      
      if (onMoveEnd) {
        runOnJS(onMoveEnd)(button.id, { x: newPercentX, y: newPercentY });
      }
    })
    // ----- THIS IS THE CORRECTED LINE -----
    .onFinalize(() => { 
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    transform: [
      { translateX: translateX.value }, 
      { translateY: translateY.value },
      { scale: withSpring(isDragging.value ? 1.1 : 1) }
    ],
    //Edited opacity
    opacity: withSpring(isDragging.value ? Math.min(0.8, typeof button.opacity === 'number' ? button.opacity : 1) : (typeof button.opacity === 'number' ? button.opacity : 1)),
    zIndex: isDragging.value ? 999 : 1,
  }));

  const absoluteStyle = { width: buttonWidth, height: buttonHeight };

  const renderButtonContent = () => {
    const props = { style: absoluteStyle };
    switch (button.type) {
      case 'joystick': return <PreviewJoystick {...props} />;
      case 'action': return <PreviewActionButton {...props} label={button.label} />;
      case 'shoulder': return <PreviewShoulderButton {...props} label={button.label} />;
      case 'dpad-up': return <PreviewDpadButton {...props} direction="up" />;
      case 'dpad-down': return <PreviewDpadButton {...props} direction="down" />;
      case 'dpad-left': return <PreviewDpadButton {...props} direction="back" />;
      case 'dpad-right': return <PreviewDpadButton {...props} direction="forward" />;
      case 'menu': return <PreviewFloatingButton {...props} iconName="menu" />;
      case 'clone': return <PreviewFloatingButton {...props} iconName="copy" />;
      default: return null;
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {renderButtonContent()}
      </Animated.View>
    </GestureDetector>
  );
};

// The main export component
export default function DraggableLayoutPreview({ layout, size, onButtonMove }) {
  return (
    <View style={styles.previewContainer}>
      {layout.buttons.map(button => (
        <DraggableButton 
          key={button.id}
          button={button}
          previewSize={size}
          onMoveEnd={onButtonMove}
        />
      ))}
    </View>
  );
}

// Styles are identical to LayoutPreview
const styles = StyleSheet.create({
  previewContainer: { flex: 1, backgroundColor: 'transparent' },
  buttonText: { color: '#E5E5E7', fontSize: 10, fontWeight: '600', textAlign: 'center' }, // Added textAlign
  actionButton: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  shoulderButton: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  joystickBase: { backgroundColor: '#525252', borderRadius: 99, justifyContent: 'center', alignItems: 'center' },
  joystickStick: { backgroundColor: '#D1D1D6', borderRadius: 50 },
  floatingButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99 },
  dpadShape: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 },
});