import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { t } from 'i18next';
import ButtonComponent from '@components/Button/ButtonComponent'; // Assuming you have a custom button

export interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  title?: string;
  readOnly?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomPicker: React.FC<CustomPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  readOnly = false,
  title = t('application.select_type', { defaultValue: 'Select type...' }),
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue || '');

  // Sync tempValue with selectedValue
  useEffect(() => {
    setTempValue(selectedValue || '');
  }, [selectedValue]);

  const selectedOption =
    options.find((opt) => opt.value === selectedValue) || null;

  const handleConfirm = () => {
    console.log('Confirm - setting value:', tempValue);
    onValueChange(tempValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempValue(selectedValue || ''); // Reset to original value
    setModalVisible(false);
  };

  return (
    <>
      {readOnly ? (
        <View style={[styles.button, { backgroundColor: '#e5e7eb' }]}>
          <Text
            style={[
              styles.buttonText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : title}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setTempValue(selectedValue || '');
            setModalVisible(true);
          }}
        >
          <Text
            style={[
              styles.buttonText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : title}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tempValue}
                onValueChange={(value) => setTempValue(value as string)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // Consistent item styling
              >
                {options.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <ButtonComponent
                width={100}
                type="primary"
                onPress={handleConfirm}
              >
                {t('task_detail.confirm', { defaultValue: 'Confirm' })}
              </ButtonComponent>
              <ButtonComponent
                width={100}
                type="secondary" // Assuming you have a secondary style
                onPress={handleCancel}
              >
                {t('task_detail.cancel', { defaultValue: 'Cancel' })}
              </ButtonComponent>
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
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    minHeight: 48, // Consistent height across platforms
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left', // Android picker buttons often align left
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    minHeight: 250, // Limit height to half screen
    width: '100%',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    ...(Platform.OS === 'ios' && { height: 230 }), // Fixed height for iOS wheel
    ...(Platform.OS === 'android' && { marginVertical: 10 }), // Spacing for Android dropdown
  },
  pickerItem: {
    fontSize: 22,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Extra padding for iOS safe area
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default CustomPicker;
