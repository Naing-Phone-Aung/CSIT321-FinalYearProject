// components/EditLayoutModal.js

import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/SettingsContext';

const EditLayoutModal = ({ 
  visible, 
  onClose, 
  onSave, 
  initialValue,
  title = "Edit Layout Name",
  message = "Enter a new name for this layout." 
}) => {
  const { theme } = useSettings();
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialValue || '');
    }
  }, [visible, initialValue]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
          
          <TextInput
            style={[
              styles.input,
              { 
                borderBottomColor: theme.colors.primary, 
                color: theme.colors.text
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Layout Name"
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus={true} 
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 8,
    marginLeft: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditLayoutModal;