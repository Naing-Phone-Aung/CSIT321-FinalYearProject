import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import DraggableLayoutPreview from '../components/DraggableLayoutPreview';
import LayoutPreview from '../components/LayoutPreview';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { loadLayouts, saveLayouts, createDefaultLayout } from '../services/LayoutService';

const MAIN_MENU_ITEMS = ['Move', 'Size', 'Opacity', 'Mapping', 'Reset'];

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

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
            e.preventDefault();
            try {
                const allLayouts = await loadLayouts();
                const updatedLayouts = allLayouts.map(l => l.id === currentLayout.id ? currentLayout : l);
                await saveLayouts(updatedLayouts);
                navigation.dispatch(e.data.action);
            } catch (error) { Alert.alert("Save Failed", "Could not save layout changes."); }
        });
        return unsubscribe;
    }, [navigation, currentLayout]);

    const handleUpdateLayout = (newLayout) => { setCurrentLayout(newLayout); };
    const handleResetLayout = () => {
        const defaultLayout = createDefaultLayout();
        setCurrentLayout({ ...currentLayout, buttons: defaultLayout.buttons, mappings: {} });
        Alert.alert("Layout Reset", "The layout has been reset to its default state.");
    };
    const handleButtonMove = (buttonId, newPosition) => {
        setCurrentLayout(prev => ({ ...prev, buttons: prev.buttons.map(b => b.id === buttonId ? { ...b, x: newPosition.x, y: newPosition.y } : b) }));
    };

    const handleMainMenuPress = (item) => {
        if (item === 'Reset') {
            handleResetLayout();
            setActiveMenu('Move');
        } else if (item === 'Mapping') {
            // This is the correct navigation action
            navigation.navigate('Mapping', { layout: currentLayout, onUpdateLayout: handleUpdateLayout });
        } else {
            setActiveMenu(item);
        }
    };

    const getPreviewSize = () => {
        if (!wrapperSize) return null;
        const { width: wrapperWidth, height: wrapperHeight } = wrapperSize;
        let previewWidth, previewHeight;
        if ((wrapperWidth / wrapperHeight) > deviceAspectRatio) {
            previewHeight = wrapperHeight;
            previewWidth = wrapperHeight * deviceAspectRatio;
        } else {
            previewWidth = wrapperWidth;
            previewHeight = wrapperWidth / deviceAspectRatio;
        }
        return { width: previewWidth, height: previewHeight };
    };
    const previewSize = getPreviewSize();

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View>
                    {activeMenu === 'Size' || activeMenu === 'Opacity' ? (
                        <View style={styles.editingMenuBar}>
                            <View style={[styles.menuButton, styles.activeMenuButton]}><Text style={styles.menuButtonText}>{activeMenu}</Text></View>
                            <Slider style={styles.slider} minimumValue={activeMenu === 'Size' ? 0.5 : 0.1} maximumValue={activeMenu === 'Size' ? 1.5 : 1.0} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#A0A0A0" thumbTintColor="#FFFFFF" value={activeMenu === 'Size' ? sizeValue : opacityValue} onValueChange={activeMenu === 'Size' ? setSizeValue : setOpacityValue} />
                            <TouchableOpacity style={styles.menuButton} onPress={() => setActiveMenu('Move')}><Text style={styles.menuButtonText}>Back</Text></TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mainMenuBar}>
                            {MAIN_MENU_ITEMS.map((item) => (<TouchableOpacity key={item} style={[styles.menuButton, activeMenu === item && styles.activeMenuButton]} onPress={() => handleMainMenuPress(item)}><Text style={styles.menuButtonText}>{item}</Text></TouchableOpacity>))}
                            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}><Text style={styles.menuButtonText}>Back</Text></TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={styles.previewWrapper} onLayout={(e) => setWrapperSize(e.nativeEvent.layout)}>
                    {previewSize && (
                        <View style={[styles.previewContainer, { width: previewSize.width, height: previewSize.height }]}>
                            {activeMenu === 'Move' ? (<DraggableLayoutPreview layout={currentLayout} size={previewSize} onButtonMove={handleButtonMove} />) : (<LayoutPreview layout={currentLayout} size={previewSize} />)}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3E3E3E' },
    mainMenuBar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
    editingMenuBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12 },
    menuButton: { backgroundColor: '#4F4F4F', width: 120, paddingVertical: 12, borderRadius: 8, margin: 6, alignItems: 'center' },
    activeMenuButton: { backgroundColor: '#6E6E6E' },
    menuButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500', textAlign: 'center' },
    slider: { width: '50%', height: 40, marginHorizontal: 6 },
    previewWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18 },
    previewContainer: { borderColor: 'rgba(255, 255, 255, 0.25)', borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
});