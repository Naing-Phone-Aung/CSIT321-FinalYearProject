// components/LayoutPreview.js

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// These simplified, non-interactive components are correct.
const PreviewJoystick = ({ style }) => <View style={[styles.joystickBase, style]}><View style={[styles.joystickStick, {width: style.width * 0.55, height: style.width * 0.55, borderRadius: style.width * 0.275}]} /></View>;
const PreviewActionButton = ({ style, label }) => <View style={[styles.actionButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewShoulderButton = ({ style, label }) => <View style={[styles.shoulderButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewDpadButton = ({ style, direction }) => <View style={[styles.dpadShape, style]}><Ionicons name={`caret-${direction}-outline`} size={12} color="#FFF" /></View>;
const PreviewFloatingButton = ({ style, iconName }) => <View style={[styles.floatingButton, style]}><Feather name={iconName} size={10} color="#FFF" /></View>;


export default function LayoutPreview({ layout, size }) {
  
  const renderPreviewButton = (button) => {
    const previewWidth = size.width;
    const previewHeight = size.height;
    
    let width, height;

    if (
      button.type === 'joystick' || 
      button.type === 'action' || 
      button.type === 'menu' || 
      button.type === 'clone' || 
      button.type.startsWith('dpad-') 
    ) {
      const diameter = (button.size / 100) * previewHeight;
      width = diameter;
      height = diameter;
    } else {
      width = (button.width / 100) * previewWidth;
      height = (button.height / 100) * previewHeight;
    }

    const absoluteStyle = {
      position: 'absolute',
      left: (button.x / 100) * previewWidth,
      top: (button.y / 100) * previewHeight,
      transform: [
        { translateX: -width / 2 },
        { translateY: -height / 2 }
      ],
      width,
      height,
    };

    const props = { style: absoluteStyle };

    switch (button.type) {
      case 'joystick': return <PreviewJoystick key={button.id} {...props} />;
      case 'action': return <PreviewActionButton key={button.id} {...props} label={button.label} />;
      case 'shoulder': return <PreviewShoulderButton key={button.id} {...props} label={button.label} />;
      case 'dpad-up': return <PreviewDpadButton key={button.id} {...props} direction="up" />;
      case 'dpad-down': return <PreviewDpadButton key={button.id} {...props} direction="down" />;
      case 'dpad-left': return <PreviewDpadButton key={button.id} {...props} direction="back" />;
      case 'dpad-right': return <PreviewDpadButton key={button.id} {...props} direction="forward" />;
      case 'menu': return <PreviewFloatingButton key={button.id} {...props} iconName="menu" />;
      case 'clone': return <PreviewFloatingButton key={button.id} {...props} iconName="copy" />;
      default: return null;
    }
  };

  return (
    <View style={styles.previewContainer}>
      {layout.buttons.map(renderPreviewButton)}
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: '#3E3E3E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonText: { color: '#E5E5E7', fontSize: 10, fontWeight: '600' },
  actionButton: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  shoulderButton: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  joystickBase: { backgroundColor: '#525252', borderRadius: 99, justifyContent: 'center', alignItems: 'center' },
  joystickStick: { backgroundColor: '#D1D1D6', borderRadius: 50 },
  floatingButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 99 },
  dpadShape: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 },
});