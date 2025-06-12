import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Text, TextField, Button, Colors } from 'react-native-ui-lib';
import { X } from 'lucide-react-native';

interface AddShelfModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddShelfModal({ visible, onClose, onAdd }: AddShelfModalProps) {
  const [shelfName, setShelfName] = useState('');

  const handleAdd = () => {
    if (shelfName.trim()) {
      onAdd(shelfName.trim());
      setShelfName('');
    }
  };

  const handleClose = () => {
    setShelfName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Добави нов рафт</Text>
            <Button
              iconSource={() => <X size={24} color={Colors.grey40} />}
              backgroundColor="transparent"
              onPress={handleClose}
              style={styles.closeButton}
            />
          </View>

          <View style={styles.content}>
            <TextField
              placeholder="Въведете име на рафта"
              value={shelfName}
              onChangeText={setShelfName}
              style={styles.textField}
              containerStyle={styles.textFieldContainer}
              fieldStyle={styles.fieldStyle}
              autoFocus
            />

            <View style={styles.buttons}>
              <Button
                label="Отказ"
                backgroundColor="transparent"
                color={Colors.grey40}
                onPress={handleClose}
                style={styles.cancelButton}
              />
              <Button
                label="Добави рафт"
                backgroundColor={Colors.blue30}
                onPress={handleAdd}
                disabled={!shelfName.trim()}
                style={styles.addButton}
              />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 20,
  },
  textFieldContainer: {
    marginBottom: 24,
  },
  textField: {
    fontSize: 16,
  },
  fieldStyle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
  },
  addButton: {
    paddingHorizontal: 20,
  },
});
