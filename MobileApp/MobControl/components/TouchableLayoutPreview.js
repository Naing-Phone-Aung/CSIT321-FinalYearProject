// components/TouchableLayoutPreview.js

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// These simplified, non-interactive components are correct.
const PreviewJoystick = ({ style }) => <View style={[styles.joystickBase, style]}><View style={[styles.joystickStick, { width: style.width * 0.55, height: style.width * 0.55, borderRadius: style.width * 0.275 }]} /></View>;
//const PreviewJoystick = ({ style, calculatedSizePx }) => (<View style={[styles.joystickBase, style]}> {calculatedSizePx && (<View style={[styles.joystickStick, {width: calculatedSizePx * 0.55, height: calculatedSizePx * 0.55, borderRadius: calculatedSizePx * 0.275}]} />)}</View>);
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
            //opacity: typeof button.opacity === 'number' ? button.opacity : 1, 
        };

        const isSelected = selectedButtonId === button.id;
        const selectionStyle = isSelected ? styles.selectedButtonHighlight : {};


        const WrapperComponent = (activeMenu === 'Size' || activeMenu === 'Opacity') ? TouchableOpacity : View;

        const wrapperProps = {
            key: button.id, 
            style: [wrapperBaseStyle, selectionStyle], 
        };

        
        if (WrapperComponent === TouchableOpacity) {
            wrapperProps.onPress = () => onSelectButton(button.id);
        }

        const innerComponentStyle = { width: '100%', height: '100%' };

        const joystickCalculatedSizePx = calculatedWidth;

        switch (button.type) {
            case 'joystick':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewJoystick style={innerComponentStyle} calculatedSizePx={joystickCalculatedSizePx} />
                    </WrapperComponent>
                );
            case 'action':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewActionButton style={innerComponentStyle} label={button.label} />
                    </WrapperComponent>
                );
            case 'shoulder':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewShoulderButton style={innerComponentStyle} label={button.label} />
                    </WrapperComponent>
                );
            case 'dpad-up':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewDpadButton style={innerComponentStyle} direction="up" />
                    </WrapperComponent>
                );
            case 'dpad-down':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewDpadButton style={innerComponentStyle} direction="down" />
                    </WrapperComponent>
                );
            case 'dpad-left':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewDpadButton style={innerComponentStyle} direction="back" />
                    </WrapperComponent>
                );
            case 'dpad-right':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewDpadButton style={innerComponentStyle} direction="forward" />
                    </WrapperComponent>
                );
            case 'menu':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewFloatingButton style={innerComponentStyle} iconName="menu" />
                    </WrapperComponent>
                );
            case 'clone':
                return (
                    <WrapperComponent {...wrapperProps}>
                        <PreviewFloatingButton style={innerComponentStyle} iconName="copy" />
                    </WrapperComponent>
                );
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
    
    selectedButtonHighlight: {
        borderColor: '#8532F3', 
        borderWidth: 2,
    },
});