// MappingScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MappingEditModal from '../components/MappingEditModal';

// These helper components have not changed
const ALL_BUTTONS = [
    { id: 'btn_a', label: 'A' }, { id: 'btn_b', label: 'B' }, { id: 'btn_x', label: 'X' }, { id: 'btn_y', label: 'Y' },
    { id: 'btn_lb', label: 'LB' }, { id: 'btn_rb', label: 'RB' }, { id: 'btn_lt', label: 'LT' }, { id: 'btn_rt', label: 'RT' },
    { id: 'menu', label: 'Start' }, { id: 'clone', label: 'Back' },
    { id: 'dpad-up', label: 'D-Pad Up' }, { id: 'dpad-down', label: 'D-Pad Down' },
    { id: 'dpad-left', label: 'D-Pad Left' }, { id: 'dpad-right', label: 'D-Pad Right' }
];

const buttonLabelMap = ALL_BUTTONS.reduce((acc, button) => {
    acc[button.id] = button.label;
    return acc;
}, {});

const MappingPill = ({ label }) => (
    <View style={styles.mappingPill}>
        <Text style={styles.mappingPillText}>{label}</Text>
    </View>
);

const MappingDisplay = ({ buttonId, mappings }) => {
    const mappedTo = mappings?.[buttonId];
    if (!mappedTo || (Array.isArray(mappedTo) && mappedTo.length === 0)) {
        return <Text style={styles.defaultMappingText}>Default</Text>;
    }
    const ids = Array.isArray(mappedTo) ? mappedTo : [mappedTo];
    return (
        <View style={styles.pillsContainer}>
            {ids.map(id => (
                <MappingPill key={id} label={buttonLabelMap[id] || '?'} />
            ))}
        </View>
    );
};


export default function MappingScreen({ route }) {
    const navigation = useNavigation();
    const { layout, onUpdateLayout } = route.params;
    const [currentLayout, setCurrentLayout] = useState(layout);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingButton, setEditingButton] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            onUpdateLayout(currentLayout);
        });
        return unsubscribe;
    }, [navigation, currentLayout, onUpdateLayout]);

    const handleSaveMapping = (originalId, newMapping) => {
        setCurrentLayout(prev => {
            const newMappings = { ...(prev.mappings || {}) };
            if (newMapping === null || (Array.isArray(newMapping) && newMapping.length === 0)) {
                delete newMappings[originalId];
            } else {
                newMappings[originalId] = newMapping;
            }
            return { ...prev, mappings: newMappings };
        });
    };

    const handleResetMappings = () => {
        Alert.alert("Reset Mappings", "Are you sure you want to remove all custom button mappings?", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: () => setCurrentLayout(prev => ({ ...prev, mappings: {} })) }
        ]);
    };

    const openEditor = (button) => {
        setEditingButton({ ...button, mappedTo: currentLayout.mappings?.[button.id] });
        setModalVisible(true);
    };
    
    return (
        <View style={styles.container}>
            {/* --- IMPROVEMENT: The side menu is back, but aligned to the top --- */}
            <SafeAreaView style={styles.sideMenuContainer} edges={['left', 'top', 'bottom']}>
                <View style={styles.sideMenu}>
                    <Pressable 
                        style={({ pressed }) => [styles.sideMenuButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} 
                        onPress={handleResetMappings}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#EAEAEA" />
                        <Text style={styles.sideMenuButtonText}>Reset</Text>
                    </Pressable>
                    <Pressable 
                        style={({ pressed }) => [styles.sideMenuButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back-outline" size={20} color="#EAEAEA" />
                        <Text style={styles.sideMenuButtonText}>Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>

            <SafeAreaView style={styles.rightPanel} edges={['top', 'right', 'bottom']}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {ALL_BUTTONS.map(button => (
                        <Pressable 
                            key={button.id} 
                            style={({ pressed }) => [styles.mappingCard, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]} 
                            onPress={() => openEditor(button)}
                        >
                            <View style={styles.buttonLabelContainer}>
                                <Text style={styles.buttonLabel}>{button.label}</Text>
                            </View>
                            
                            <View style={styles.mappedValueContainer}>
                                <MappingDisplay buttonId={button.id} mappings={currentLayout.mappings} />
                            </View>

                            <Ionicons name="chevron-forward" size={24} color="#888" />
                        </Pressable>
                    ))}
                </ScrollView>
            </SafeAreaView>

            <MappingEditModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveMapping} editingButton={editingButton} />
        </View>
    );
}

// --- STYLESHEET WITH THE CORRECTED SIDE MENU STYLES ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: '#3E3E3E' 
    },
    // --- Styles for the top-aligned side menu ---
    sideMenuContainer: { 
        backgroundColor: '#212121', 
        borderRightWidth: 1, 
        borderRightColor: 'rgba(255, 255, 255, 0.05)',
        // NOTE: We REMOVED `justifyContent: 'center'` to align to top
    },
    sideMenu: { 
        paddingHorizontal: 15,
        paddingTop: 15, // Space from the top edge
    },
    sideMenuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A4A4A',
        width: 160,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sideMenuButtonText: { 
        color: '#EAEAEA', 
        fontSize: 16, 
        fontWeight: '500', 
        marginLeft: 10 
    },
    // --- Styles for the right panel content ---
    rightPanel: { 
        flex: 1,
    },
    scrollContent: { 
        padding: 15,
    },
    mappingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 6,
        backgroundColor: '#484848',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    buttonLabelContainer: { 
        width: 120,
    },
    buttonLabel: { 
        color: '#EAEAEA', 
        fontSize: 18, 
        fontWeight: '600' 
    },
    mappedValueContainer: { 
        flex: 1, 
        alignItems: 'flex-end', 
        paddingRight: 10,
    },
    defaultMappingText: {
        color: '#999',
        fontSize: 16,
        fontStyle: 'italic',
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    mappingPill: {
        backgroundColor: '#606060',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 2,
    },
    mappingPillText: {
        color: '#EAEAEA',
        fontSize: 14,
        fontWeight: '500',
    },
});