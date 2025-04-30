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
import ButtonComponent from '@components/Button/ButtonComponent';

export interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  options: Option[];
  selectedValue: string | undefined | null;
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
  const [tempValue, setTempValue] = useState<string>('');

  const selectedOption = options.find((opt) => opt.value === selectedValue) || null;

  useEffect(() => {
    const initialValue =
      selectedValue && options.some((opt) => opt.value === selectedValue) ? selectedValue : '';
    setTempValue(initialValue);
  }, [selectedValue, options]);

  const handleConfirm = () => {
    onValueChange(tempValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    const resetValue =
      selectedValue && options.some((opt) => opt.value === selectedValue) ? selectedValue : '';
    setTempValue(resetValue);
    setModalVisible(false);
  };

  return (
    <>
      {readOnly ? (
        <View style={[styles.button, { backgroundColor: '#e5e7eb' }]}>
          <Text style={[styles.buttonText, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : title}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const initialValue =
              selectedValue && options.some((opt) => opt.value === selectedValue)
                ? selectedValue
                : '';
            setTempValue(initialValue);
            setModalVisible(true);
          }}
        >
          <Text style={[styles.buttonText, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : title}
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType='slide' onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tempValue}
                onValueChange={(value) => setTempValue(value as string)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label={title} value='' />
                {options.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <ButtonComponent width={100} type='primary' onPress={handleConfirm}>
                {t('task_detail.confirm', { defaultValue: 'Confirm' })}
              </ButtonComponent>
              <ButtonComponent width={100} type='secondary' onPress={handleCancel}>
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
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
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
    minHeight: 250,
    width: '100%',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    ...(Platform.OS === 'ios' && { height: 230 }),
    ...(Platform.OS === 'android' && { marginVertical: 10 }),
  },
  pickerItem: {
    fontSize: 22,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

export default CustomPicker;
