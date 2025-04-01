import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  title?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  title = 'Select',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);

  useEffect(() => {
    setTempValue(selectedValue); // Update tempValue when selectedValue changes
  }, [selectedValue]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTempValue(selectedValue); // Reset to selected value when opening modal
          setModalVisible(true);
        }}
      >
        <Text
          style={[styles.buttonText, !selectedOption && styles.placeholderText]}
        >
          {selectedOption ? selectedOption.label : title}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={tempValue}
              onValueChange={(value) => setTempValue(value)} // Handle picker value change
            >
              {options.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <Button
                title="Confirm"
                onPress={() => {
                  onValueChange(tempValue); // Pass the selected value to the parent
                  setModalVisible(false);
                }}
              />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});

export default CustomPicker;
