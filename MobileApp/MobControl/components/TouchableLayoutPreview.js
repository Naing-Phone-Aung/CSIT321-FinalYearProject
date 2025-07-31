// components/TouchableLayoutPreview.js

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// These simplified, non-interactive components are correct.
const PreviewJoystick = ({ style, sizePx }) => (
    <View style={[styles.joystickBase, style]}>
        <View style={[styles.joystickStick, { width: sizePx * 0.55, height: sizePx * 0.55, borderRadius: sizePx * 0.275 }]} />
    </View>
);
const PreviewActionButton = ({ style, label }) => <View style={[styles.actionButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewShoulderButton = ({ style, label }) => <View style={[styles.shoulderButton, style]}><Text style={styles.buttonText}>{label}</Text></View>;
const PreviewDpadButton = ({ style, direction }) => <View style={[styles.dpadShape, style]}><Ionicons name={`caret-${direction}-outline`} size={12} color="#FFF" /></View>;
const PreviewFloatingButton = ({ style, iconName }) => <View style={[styles.floatingButton, style]}><Feather name={iconName} size={10} color="#FFF" /></View>;


export default function TouchableLayoutPreview({ layout, size, activeMenu, onSelectButton, selectedButtonId }) {

    const renderPreviewButton = (button) => {
        const previewWidth = size.width;
        const previewHeight = size.height;

        let calculatedWidth, calculatedHeight;

        if (
            button.type === 'joystick' ||
            button.type === 'action' ||
            button.type === 'menu' ||
            button.type === 'clone' ||
            button.type.startsWith('dpad-')
        ) {
            const effectiveSize = typeof button.size === 'number' ? button.size : 100;
            const diameter = (effectiveSize / 100) * previewHeight;
            calculatedWidth = diameter;
            calculatedHeight = diameter;
        } else {
            calculatedWidth = (typeof button.width === 'number' ? button.width / 100 : 0.11) * previewWidth;
            calculatedHeight = (typeof button.height === 'number' ? button.height / 100 : 0.14) * previewHeight;
        }

        const wrapperBaseStyle = {
            position: 'absolute',
            left: (button.x / 100) * previewWidth,
            top: (button.y / 100) * previewHeight,
            transform: [
                { translateX: -calculatedWidth / 2 },
                { translateY: -calculatedHeight / 2 }
            ],
            width: calculatedWidth,  
            height: calculatedHeight,
            //Added opacity
            opacity: typeof button.opacity === 'number' ? button.opacity : 1,
        };

        const isSelected = selectedButtonId === button.id;
        const selectionStyle = isSelected ? styles.selectedButtonHighlight : {};


        const WrapperComponent = (activeMenu === 'Size' || activeMenu === 'Opacity') ? TouchableOpacity : View;

        const wrapperProps = {
            style: [wrapperBaseStyle, selectionStyle],
        };

        if (WrapperComponent === TouchableOpacity) {
            wrapperProps.onPress = () => onSelectButton(button.id);
        }

        const innerComponentStyle = { width: '100%', height: '100%' };

        let innerComponent;
        switch (button.type) {
            case 'joystick':
                innerComponent = <PreviewJoystick style={innerComponentStyle} sizePx={calculatedWidth} />;                
                break;
            case 'action':
                innerComponent = <PreviewActionButton style={innerComponentStyle} label={button.label} />;
                break;
            case 'shoulder':
                innerComponent = <PreviewShoulderButton style={innerComponentStyle} label={button.label} />;
                break;
            case 'dpad-up':
                innerComponent = <PreviewDpadButton style={innerComponentStyle} direction="up" />;
                break;
            case 'dpad-down':
                innerComponent = <PreviewDpadButton style={innerComponentStyle} direction="down" />;
                break;
            case 'dpad-left':
                innerComponent = <PreviewDpadButton style={innerComponentStyle} direction="back" />;
                break;
            case 'dpad-right':
                innerComponent = <PreviewDpadButton style={innerComponentStyle} direction="forward" />;
                break;
            case 'menu':
                innerComponent = <PreviewFloatingButton style={innerComponentStyle} iconName="menu" />;
                break;
            case 'clone':
                innerComponent = <PreviewFloatingButton style={innerComponentStyle} iconName="copy" />;
                break;
            default:
                return null;
        }

        return (
            <WrapperComponent key={button.id} {...wrapperProps}>
                {innerComponent}
            </WrapperComponent>
        );
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
    
    selectedButtonHighlight: {
        borderColor: '#8532F3', 
        borderWidth: 2,
    },
});