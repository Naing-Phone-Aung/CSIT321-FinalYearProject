import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TARGET_BUTTONS = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'D-Pad Up', 'D-Pad Down', 'D-Pad Left', 'D-Pad Right', 'Start', 'Back'];
const TARGET_BUTTON_IDS = ['btn_a', 'btn_b', 'btn_x', 'btn_y', 'btn_lb', 'btn_rb', 'btn_lt', 'btn_rt', 'dpad-up', 'dpad-down', 'dpad-left', 'dpad-right', 'menu', 'clone'];

export default function MappingEditModal({ visible, onClose, onSave, editingButton }) {
    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => {
        if (editingButton?.mappedTo) {
            const currentMapping = editingButton.mappedTo;
            if (Array.isArray(currentMapping)) {
                // The order is preserved from the saved combo
                setSelectedKeys(currentMapping.map(id => TARGET_BUTTONS[TARGET_BUTTON_IDS.indexOf(id)]));
            } else {
                setSelectedKeys([TARGET_BUTTONS[TARGET_BUTTON_IDS.indexOf(currentMapping)]]);
            }
        } else {
            setSelectedKeys([]);
        }
    }, [editingButton]);

    const handleSelectKey = (key) => {
        setSelectedKeys(prevKeys => {
            if (prevKeys.includes(key)) {
                return prevKeys.filter(k => k !== key);
            } else {
                return [...prevKeys, key]; 
            }
        });
    };

    const handleSave = () => {
        if (selectedKeys.length === 0) {
            onSave(editingButton.id, null);
        } else if (selectedKeys.length === 1) {
            onSave(editingButton.id, TARGET_BUTTON_IDS[TARGET_BUTTONS.indexOf(selectedKeys[0])]);
        } else {
            const comboIds = selectedKeys.map(key => TARGET_BUTTON_IDS[TARGET_BUTTONS.indexOf(key)]);
            onSave(editingButton.id, comboIds);
        }
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Remap Button: {editingButton?.label}</Text>
                    <ScrollView contentContainerStyle={styles.keyGrid}>
                        {TARGET_BUTTONS.map(key => {
                            const selectionIndex = selectedKeys.indexOf(key); 
                            const isSelected = selectionIndex !== -1;

                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.keyButton, isSelected && styles.selectedKeyButton]}
                                    onPress={() => handleSelectKey(key)}
                                >
                                    {/* Badge to show selection order */}
                                    {isSelected && selectedKeys.length > 1 && (
                                        <View style={styles.orderBadge}>
                                            <Text style={styles.orderBadgeText}>{selectionIndex + 1}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.keyText}>{key}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={onClose}><Text style={styles.actionButtonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}><Text style={[styles.actionButtonText, {color: '#FFF'}]}>Save</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', maxHeight: '80%', backgroundColor: '#2E2E2E', borderRadius: 12, padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 20 },
    instruction: { color: '#A0A0A0', fontSize: 16, marginBottom: 15, textAlign: 'center' },
    keyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 10 },
    keyButton: {
        backgroundColor: '#4F4F4F',
        padding: 12,
        borderRadius: 6,
        margin: 5,
        minWidth: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', // Align badge and text
    },
    selectedKeyButton: { backgroundColor: '#8532F3', borderColor: '#FFF', borderWidth: 1.5 },
    keyText: { color: '#FFF', fontSize: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#444' },
    actionButton: { padding: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
    actionButtonText: { color: '#A0A0A0', fontSize: 16, fontWeight: 'bold' },
    saveButton: { backgroundColor: '#8532F3', marginLeft: 15 },
    // Styles for the order indicator badge
    orderBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#8532F3',
    },
    orderBadgeText: {
        color: '#8532F3',
        fontWeight: 'bold',
        fontSize: 14,
    },
});