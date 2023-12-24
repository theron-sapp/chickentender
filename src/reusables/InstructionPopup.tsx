import React from 'react';
import {Modal, Text, TouchableOpacity, View, StyleSheet} from 'react-native';

interface InstructionPopupProps {
  isVisible: boolean;
  onClose: () => void;
  content1: string;
  content2: string;
  content3: string;
  content4: string;
}

const InstructionPopup: React.FC<InstructionPopupProps> = ({
  isVisible,
  onClose,
  content1,
  content2,
  content3,
  content4,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{content1}</Text>
          <Text style={styles.contentText}>{content2}</Text>
          <Text style={styles.contentText}>{content3}</Text>
          <Text style={styles.contentText}>{content4}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor: 'green',
    width: '100%',
    height: '50%',
  },
  contentContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, .9)',
    // backgroundColor: 'red',
    padding: 20,
    borderRadius: 10,
    margin: 120,
  },
  contentText: {
    fontSize: 16,
    color: 'white',
    margin: 4,
  },
  closeButton: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    left: 20,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default InstructionPopup;
