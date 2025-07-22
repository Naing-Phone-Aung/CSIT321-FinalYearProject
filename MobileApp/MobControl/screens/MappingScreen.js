import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MappingEditModal from '../components/MappingEditModal';

// This list is now used as a lookup table for labels
const ALL_BUTTONS = [
    { id: 'btn_a', label: 'A' }, { id: 'btn_b', label: 'B' }, { id: 'btn_x', label: 'X' }, { id: 'btn_y', label: 'Y' },
    { id: 'btn_lb', label: 'LB' }, { id: 'btn_rb', label: 'RB' }, { id: 'btn_lt', label: 'LT' }, { id: 'btn_rt', label: 'RT' },
    { id: 'menu', label: 'Start' }, { id: 'clone', label: 'Back' },
    { id: 'dpad-up', label: 'D-Pad Up' }, { id: 'dpad-down', label: 'D-Pad Down' },
    { id: 'dpad-left', label: 'D-Pad Left' }, { id: 'dpad-right', label: 'D-Pad Right' }
];

// A helper map for faster label lookups
const buttonLabelMap = ALL_BUTTONS.reduce((acc, button) => {
    acc[button.id] = button.label;
    return acc;
}, {});

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

    // --- MODIFIED FUNCTION ---
    const getMappingDisplay = (buttonId) => {
        const mappedTo = currentLayout.mappings?.[buttonId];

        // If not mapped, show 'Default'
        if (!mappedTo) {
            return 'Default';
        }

        // If it's a combo (array of button IDs)
        if (Array.isArray(mappedTo)) {
            // If the array is empty, treat as Default
            if (mappedTo.length === 0) return 'Default';
            
            // Map each button ID in the combo to its label
            const comboLabels = mappedTo.map(id => buttonLabelMap[id] || '?');
            
            // Join the labels with ' + ' and wrap in parentheses
            return `(${comboLabels.join(' + ')})`;
        }
        
        // If it's a single key, find its label
        return buttonLabelMap[mappedTo] || 'Default';
    };
    
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.sideMenuContainer} edges={['left', 'top', 'bottom']}>
                <View style={styles.sideMenu}>
                    <TouchableOpacity style={styles.sideMenuButton} onPress={handleResetMappings}>
                        <Text style={styles.sideMenuButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sideMenuButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.sideMenuButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <SafeAreaView style={styles.rightPanel} edges={['top', 'right', 'bottom']}>
                <ScrollView>
                    {ALL_BUTTONS.map(button => (
                        <TouchableOpacity key={button.id} style={styles.mappingRow} onPress={() => openEditor(button)}>
                            <View style={styles.buttonIdContainer}>
                                <Text style={styles.buttonLabel}>{button.label}</Text>
                            </View>
                            <View style={styles.mappedValue}>
                                <Text style={styles.mappedValueText}>{getMappingDisplay(button.id)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#888" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>

            <MappingEditModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveMapping} editingButton={editingButton} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#3E3E3E' },
    sideMenuContainer: { backgroundColor: '#212121', justifyContent: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.05)' },
    sideMenu: { paddingHorizontal: 20 },
    sideMenuButton: { backgroundColor: '#4A4A4A', width: 160, paddingVertical: 15, borderRadius: 12, marginVertical: 10, alignItems: 'center' },
    sideMenuButtonText: { color: '#EAEAEA', fontSize: 18, fontWeight: '500' },
    rightPanel: { flex: 1, padding: 10 },
    mappingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
    buttonIdContainer: { width: 120 },
    buttonLabel: { color: '#EAEAEA', fontSize: 18, fontWeight: '500' },
    mappedValue: { flex: 1, alignItems: 'flex-end', paddingRight: 10 },
    mappedValueText: { color: '#A0A0A0', fontSize: 16 },
});