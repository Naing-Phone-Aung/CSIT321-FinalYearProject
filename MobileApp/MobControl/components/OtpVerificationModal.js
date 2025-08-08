import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { useSettings } from '../context/SettingsContext'; 

const OTP_LENGTH = 6;

export default function OtpVerificationModal({ visible, onVerify, onClose }) {
  const { theme } = useSettings();
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      inputRefs.current[0]?.focus();
    } else {
      setOtp(new Array(OTP_LENGTH).fill(''));
      setError('');
    }
  }, [visible]);

  const handleTextChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    onVerify(enteredOtp);
    Keyboard.dismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>OTP Verification</Text>
          <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>To complete your request, enter the one-time password shown on your PC.</Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                style={[
                  styles.otpInput,
                  { 
                    backgroundColor: theme.colors.separator,
                    borderColor: theme.colors.separator,
                    color: theme.colors.text,
                  }
                ]}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                value={digit}
                placeholderTextColor={theme.colors.textSecondary}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]} onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    centeredView: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.6)' 
    },
    modalView: { 
        width: '90%', 
        borderRadius: 20, 
        padding: 25, 
        alignItems: 'center', 
        elevation: 5 
    },
    modalTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 15,
    },
    modalText: { 
        fontSize: 16, 
        textAlign: 'center', 
        marginBottom: 20 
    },
    otpContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%', 
        marginBottom: 20 
    },
    otpInput: { 
        width: 45, 
        height: 55, 
        borderWidth: 1.5,
        borderRadius: 8, 
        textAlign: 'center', 
        fontSize: 22, 
    },
    errorText: { 
        color: '#D32F2F',
        marginBottom: 15 
    },
    verifyButton: { 
        width: '100%', 
        padding: 15, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginBottom: 15 
    },
    verifyButtonText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    cancelText: { 
        fontSize: 16 
    }
});