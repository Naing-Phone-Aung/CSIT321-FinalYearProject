// MappingEditModal.js

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BUTTON_GROUPS = [
    {
        title: 'Action Buttons',
        data: [{ id: 'btn_a', label: 'A' }, { id: 'btn_b', label: 'B' }, { id: 'btn_x', label: 'X' }, { id: 'btn_y', label: 'Y' }],
    },
    {
        title: 'Shoulder & Triggers',
        data: [{ id: 'btn_lb', label: 'LB' }, { id: 'btn_rb', label: 'RB' }, { id: 'btn_lt', label: 'LT' }, { id: 'btn_rt', label: 'RT' }],
    },
    {
        title: 'Directional Pad',
        data: [{ id: 'dpad-up', label: 'D-Pad Up' }, { id: 'dpad-down', label: 'D-Pad Down' }, { id: 'dpad-left', label: 'D-Pad Left' }, { id: 'dpad-right', label: 'D-Pad Right' }],
    },
    {
        title: 'System Buttons',
        data: [{ id: 'menu', label: 'Start' }, { id: 'clone', label: 'Back' }],
    }
];

const ALL_BUTTONS_FLAT = BUTTON_GROUPS.flatMap(group => group.data);
const TARGET_BUTTON_IDS = ALL_BUTTONS_FLAT.map(b => b.id);
const TARGET_BUTTON_LABELS = ALL_BUTTONS_FLAT.map(b => b.label);

const ComboPill = ({ label, onRemove }) => (
    <View style={styles.comboPill}>
        <Text style={styles.comboPillText}>{label}</Text>
        <Pressable onPress={onRemove} style={styles.comboPillRemove}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
        </Pressable>
    </View>
);

export default function MappingEditModal({ visible, onClose, onSave, editingButton }) {
    const [sequence, setSequence] = useState([]);

    useEffect(() => {
        if (editingButton?.mappedTo) {
            const currentMapping = Array.isArray(editingButton.mappedTo) ? editingButton.mappedTo : [editingButton.mappedTo];
            const initialSequence = currentMapping.map((buttonId, index) => ({
                uniqueId: Date.now() + index,
                label: TARGET_BUTTON_LABELS[TARGET_BUTTON_IDS.indexOf(buttonId)]
            }));
            setSequence(initialSequence);
        } else {
            setSequence([]);
        }
    }, [editingButton]);

    const handleAddToSequence = (label) => {
        const newItem = {
            uniqueId: Date.now() + Math.random(),
            label: label
        };
        setSequence(prevSequence => [...prevSequence, newItem]);
    };
    
    const handleRemoveFromSequence = (uniqueIdToRemove) => {
        setSequence(prevSequence => prevSequence.filter(item => item.uniqueId !== uniqueIdToRemove));
    };

    const handleSave = () => {
        if (sequence.length === 0) {
            onSave(editingButton.id, null);
        } else {
            const comboIds = sequence.map(item => TARGET_BUTTON_IDS[TARGET_BUTTON_LABELS.indexOf(item.label)]);
            const finalMapping = comboIds.length === 1 ? comboIds[0] : comboIds;
            onSave(editingButton.id, finalMapping);
        }
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.horizontalLayout}>
                        
                        <View style={styles.leftColumn}>
                            <Text style={styles.title}>Edit Mapping: {editingButton?.label}</Text>
                            
                            <Text style={styles.instruction}>
                                Current Sequence:
                            </Text>
                            <View style={styles.comboDisplay}>
                                {sequence.length === 0 ? (
                                    <Text style={styles.noMappingText}>No Mapping (Default)</Text>
                                ) : (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {sequence.map(item => (
                                            <ComboPill 
                                                key={item.uniqueId}
                                                label={item.label} 
                                                onRemove={() => handleRemoveFromSequence(item.uniqueId)} 
                                            />
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                             <Text style={[styles.instruction, {marginTop: 20}]}>
                                Tap buttons on the right to build your sequence.
                            </Text>
                        </View>

                        <View style={styles.rightColumn}>
                            <ScrollView>
                                {BUTTON_GROUPS.map(group => (
                                    <View key={group.title}>
                                        <Text style={styles.groupTitle}>{group.title}</Text>
                                        <View style={styles.keyGrid}>
                                            {group.data.map(button => (
                                                <Pressable
                                                    key={button.id}
                                                    style={styles.keyButton}
                                                    onPress={() => handleAddToSequence(button.label)}
                                                >
                                                    <Text style={styles.keyText}>{button.label}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.buttonRow}>
                                <Pressable style={({pressed}) => [styles.actionButton, {opacity: pressed ? 0.7 : 1}]} onPress={onClose}>
                                    <Ionicons name="close-circle-outline" size={20} color="#A0A0A0" />
                                    <Text style={styles.actionButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={({pressed}) => [styles.actionButton, styles.saveButton, {opacity: pressed ? 0.7 : 1}]} onPress={handleSave}>
                                    <Ionicons name="save-outline" size={20} color="#FFF" />
                                    <Text style={[styles.actionButtonText, {color: '#FFF'}]}>Save</Text>
                                </Pressable>
                            </View>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#2E2E2E',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10
    },
    horizontalLayout: {
        flexDirection: 'row',
        maxHeight: '100%',
    },
    leftColumn: {
        flex: 1,
        paddingRight: 15,
        borderRightWidth: 1,
        borderRightColor: '#444',
    },
    rightColumn: {
        flex: 1.2, 
        paddingLeft: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 10
    },
    instruction: {
        color: '#A0A0A0',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center'
    },
    groupTitle: {
        color: '#CCC',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingBottom: 5
    },
    keyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },
    keyButton: {
        backgroundColor: '#4F4F4F',
        padding: 12,
        borderRadius: 8,
        margin: 4,
        minWidth: '45%',
        flexGrow: 1,
        alignItems: 'center'
    },
    keyText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500'
    },
    comboDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 60, 
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        padding: 5,
        marginBottom: 10
    },
    noMappingText: {
        color: '#888',
        fontStyle: 'italic',
        width: '100%',
        textAlign: 'center',
    },
    comboPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8532F3',
        borderRadius: 16,
        paddingLeft: 12,
        paddingRight: 4,
        paddingVertical: 4,
        margin: 4
    },
    comboPillText: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    comboPillRemove: {
        marginLeft: 5,
        padding: 2
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#444'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        justifyContent: 'center'
    },
    actionButtonText: {
        color: '#A0A0A0',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    },
    saveButton: {
        backgroundColor: '#8532F3',
        marginLeft: 15
    },
});