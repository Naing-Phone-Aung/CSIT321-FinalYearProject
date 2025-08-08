import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import DraggableLayoutPreview from '../components/DraggableLayoutPreview';
import TouchableLayoutPreview from '../components/TouchableLayoutPreview';
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

    const [sizeValue, setSizeValue] = useState(0.5); 
    const [opacityValue, setOpacityValue] = useState(1);

    const [selectedButtonId, setSelectedButtonId] = useState(null);
   
    const [originalButtonSize, setOriginalButtonSize] = useState(null);


    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
            e.preventDefault(); 
            try {
                const allLayouts = await loadLayouts();
                const updatedLayouts = allLayouts.map(l => l.id === currentLayout.id ? currentLayout : l);
                await saveLayouts(updatedLayouts);
                navigation.dispatch(e.data.action); 
            } catch (error) {
                Alert.alert("Save Failed", "Could not save layout changes.");
            }
        });
        return unsubscribe;
    }, [navigation, currentLayout]);

    useEffect(() => {
        if (selectedButtonId) {
            const button = currentLayout.buttons.find(b => b.id === selectedButtonId);
            if (button) {
                if (activeMenu === 'Size') {
                   
                    if (originalButtonSize !== null) {
                        const minRange = originalButtonSize * 0.5;
                        const maxRange = originalButtonSize * 1.5;
                        const normalizedSize = (button.size - minRange) / (maxRange - minRange);
                        setSizeValue(normalizedSize);
                    } else {
                        setSizeValue(0.5);
                    }
                } else if (activeMenu === 'Opacity') {
                    setOpacityValue(typeof button.opacity === 'number' ? button.opacity : 1);
                }
            }
        } else {
            setSizeValue(0.5); 
            setOpacityValue(1);
        }
    }, [selectedButtonId, currentLayout, activeMenu, originalButtonSize]); 

    const handleUpdateLayout = (newLayout) => { setCurrentLayout(newLayout); };
    
    const handleResetLayout = () => {
        Alert.alert(
            "Reset Layout",
            "Are you sure you want to reset this layout to its default state? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: () => {
                        const defaultLayout = createDefaultLayout();
                        setCurrentLayout({ ...currentLayout, buttons: defaultLayout.buttons, mappings: {} });
                        setSelectedButtonId(null); 
                        setOriginalButtonSize(null); 
                        setActiveMenu('Move');
                        Alert.alert("Layout Reset", "The layout has been reset to its default state.");
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    const handleButtonMove = (buttonId, newPosition) => {
        setCurrentLayout(prev => ({ ...prev, buttons: prev.buttons.map(b => b.id === buttonId ? { ...b, x: newPosition.x, y: newPosition.y } : b) }));
    };

    const handleMainMenuPress = (item) => {
        if (item === 'Reset') {
            handleResetLayout();
        } else if (item === 'Mapping') {
            navigation.navigate('Mapping', { layout: currentLayout, onUpdateLayout: handleUpdateLayout });
            setActiveMenu(item); 
        } else {
            setActiveMenu(item);
            setSelectedButtonId(null); 
            setOriginalButtonSize(null); 
            if (item === 'Size') {
                setSizeValue(0.5); 
            } else if (item === 'Opacity') {
                setOpacityValue(1); 
            }
        }
    };

    const handleSelectButton = (buttonId) => {
        setSelectedButtonId(buttonId);
        const button = currentLayout.buttons.find(b => b.id === buttonId);
        if (button) {
            if (activeMenu === 'Size') {
                
                if (typeof button.size === 'number') {
                    setOriginalButtonSize(button.size);
                  
                    setSizeValue(0.5); 
                } else {
                    setOriginalButtonSize(null); 
                    setSizeValue(0.5); 
                }
            } else if (activeMenu === 'Opacity') {
                setOpacityValue(typeof button.opacity === 'number' ? button.opacity : 1);
            }
        }
    };

    const handleUpdateButtonSize = (sliderNormalizedValue) => {
        if (selectedButtonId && originalButtonSize !== null) {
            const minRange = originalButtonSize * 0.5; 
            const maxRange = originalButtonSize * 1.5; 
            const newSize = minRange + (sliderNormalizedValue * (maxRange - minRange));

            setCurrentLayout(prev => ({
                ...prev,
                buttons: prev.buttons.map(b =>
                    b.id === selectedButtonId ? { ...b, size: newSize } : b
                )
            }));
            setSizeValue(sliderNormalizedValue);
        } else if (selectedButtonId) {
            console.warn("Cannot scale button: No original size reference or button type doesn't support 'size' property for scaling.");
            setSizeValue(sliderNormalizedValue); 
        }
    };
    const handleUpdateButtonOpacity = (sliderNormalizedValue) => {
        setOpacityValue(sliderNormalizedValue);
        setCurrentLayout(prev => ({
            ...prev,
            buttons: prev.buttons.map(b =>
            selectedButtonId ? (b.id === selectedButtonId ? { ...b, opacity: sliderNormalizedValue } : b) : { ...b, opacity: sliderNormalizedValue }
            ),
        }));
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
                            <Slider
                                style={styles.slider}
                                minimumValue={0} 
                                maximumValue={1}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="#A0A0A0"
                                thumbTintColor="#FFFFFF"
                                value={activeMenu === 'Size' ? sizeValue : opacityValue}
                                onValueChange={activeMenu === 'Size' ? handleUpdateButtonSize : handleUpdateButtonOpacity}
                            />
                            <TouchableOpacity style={styles.menuButton} onPress={() => setActiveMenu('Move')}><Text style={styles.menuButtonText}>Back</Text></TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mainMenuBar}>
                            {MAIN_MENU_ITEMS.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.menuButton, activeMenu === item ? styles.activeMenuButton : null]}
                                    onPress={() => handleMainMenuPress(item)}
                                >
                                    <Text style={styles.menuButtonText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.menuButtonText}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={styles.previewWrapper} onLayout={(e) => setWrapperSize(e.nativeEvent.layout)}>
                    {previewSize && (
                        <View style={[styles.previewContainer, { width: previewSize.width, height: previewSize.height }]}>
                            {activeMenu === 'Move' ? (
                                <DraggableLayoutPreview layout={currentLayout} size={previewSize} onButtonMove={handleButtonMove} />
                            ) : (
                                <TouchableLayoutPreview layout={currentLayout} size={previewSize} activeMenu={activeMenu} onSelectButton={handleSelectButton} selectedButtonId={selectedButtonId} />
                            )}
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
    slider: { flex: 1, height: 40, marginHorizontal: 6 }, 
    previewWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18 },
    previewContainer: { borderColor: 'rgba(255, 255, 255, 0.25)', borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
});