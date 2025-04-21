import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'react-query';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@config/axios/axios';
import { t } from 'i18next';

interface IdentityCardData {
  id: string;
  name: string;
  dob: string;
  sex: string;
  nationality: string;
  home: string;
  address: string;
  doe: string;
  overall_score: string;
  type: string;
}

interface FormDataType {
  name: string;
  phoneNumber: string;
  address: string;
  dob: string; // YYYY-MM-DD format
  gender: string;
}

const UpdateUserInfoScan = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [cardData, setCardData] = useState<IdentityCardData | null>(null);
  const [scannedData, setScannedData] = useState<IdentityCardData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // State for phone number
  const [phoneError, setPhoneError] = useState<string>(''); // State for phone number validation error

  // Normalize gender for translation and API
  const normalizeGender = (sex: string): string => {
    if (sex.toUpperCase() === 'NAM') return 'male';
    if (sex.toUpperCase() === 'NỮ') return 'female';
    return sex.toLowerCase();
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD
  const convertToYYYYMMDD = (date: string): string => {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Validate phone number (basic validation for 10 digits)
  const validatePhoneNumber = (value: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError(t('profile.phone_invalid', { defaultValue: 'Phone number must be 10 digits' }));
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  // Mutation for scanning identity card
  const scanMutation = useMutation(
    async (formData: FormData) => {
      const response = await apiClient.post('/ocr/cccd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('scan', response.data);
      return response.data;
    },
    {
      onSuccess: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          const newCardData: IdentityCardData = {
            id: data.id,
            name: data.name,
            dob: data.dob,
            sex: data.sex,
            nationality: data.nationality,
            home: data.home,
            address: data.address,
            doe: data.doe,
            overall_score: data.overall_score,
            type: data.type,
          };
          setScannedData(newCardData);
          setOptionsModalVisible(true);
        } else {
          throw new Error(response.errorMessage || 'No valid data returned');
        }
      },
      onError: (error: any) => {
        Alert.alert(
          t('profile.identity_scan_error', { defaultValue: 'Failed to scan identity card' }),
          error.message || t('profile.identity_scan_error')
        );
      },
    }
  );

  // Mutation for updating user profile
  const updateMutation = useMutation(
    async (formData: FormDataType) => {
      const response = await apiClient.put('/users/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('formDataUpdateUser', formData);
      return response.data;
    },
    {
      onSuccess: () => {
        setCardData(scannedData);
        setOptionsModalVisible(false);
        Alert.alert(
          t('profile.update_success', { defaultValue: 'Profile updated successfully' }),
          t('profile.update_success_message', { defaultValue: 'Your profile has been updated' })
        );
      },
      onError: (error: any) => {
        Alert.alert(
          t('profile.update_error', { defaultValue: 'Failed to update profile' }),
          error.message || t('profile.update_error')
        );
      },
    }
  );

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('permission_denied', { defaultValue: 'Permission Denied' }),
        t('camera_permission_required', { defaultValue: 'Camera permission required' })
      );
      return false;
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setModalVisible(false);
      const selectedImage = result.assets[0].uri;
      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: `identity_card.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      scanMutation.mutate(formData);
    }
  };

  const takePicture = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setModalVisible(false);
      const capturedImage = result.assets[0].uri;
      const uriParts = capturedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('file', {
        uri: capturedImage,
        name: `identity_card.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      scanMutation.mutate(formData);
    }
  };

  const handleConfirm = () => {
    setCardData(scannedData);
    setOptionsModalVisible(false);
    Alert.alert(
      t('profile.identity_scan_success', { defaultValue: 'Identity card scanned successfully' }),
      t('profile.identity_scan_success_message', { defaultValue: 'Data extracted successfully' })
    );
  };

  const handleUpdateProfile = () => {
    if (!scannedData) return;
    if (!validatePhoneNumber(phoneNumber)) return;

    const formData: FormDataType = {
      name: scannedData.name,
      phoneNumber: phoneNumber,
      address: scannedData.address,
      dob: convertToYYYYMMDD(scannedData.dob),
      gender: normalizeGender(scannedData.sex),
    };

    updateMutation.mutate(formData);
  };

  return (
    <LinearGradient colors={['#007AFF', '#52c41a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {t('update_scan.title', { defaultValue: 'Update User Info - Scan' })}
          </Text>
          <Text style={styles.subtitle}>
            {t('update_scan.message', {
              defaultValue: 'Scan your identity card to update your information.',
            })}
          </Text>

          <TouchableOpacity style={styles.scanButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>
              {t('update_scan.scan', { defaultValue: 'Start Scan' })}
            </Text>
          </TouchableOpacity>

          {cardData && (
            <Card style={styles.dataCard}>
              <Card.Content style={styles.cardContent}>
                <ScrollView contentContainerStyle={styles.dataContainer}>
                  <Text style={styles.dataText}>
                    {t('profile.id', { defaultValue: 'ID' })}: {cardData.id}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.name', { defaultValue: 'Name' })}: {cardData.name}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.date_of_birth', { defaultValue: 'Date of Birth' })}: {cardData.dob}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.gender', { defaultValue: 'Gender' })}:{' '}
                    {t(`profile.${normalizeGender(cardData.sex)}`)}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.nationality', { defaultValue: 'Nationality' })}:{' '}
                    {cardData.nationality}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.home', { defaultValue: 'Home' })}: {cardData.home}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.address', { defaultValue: 'Address' })}: {cardData.address}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.date_of_expiry', { defaultValue: 'Date of Expiry' })}:{' '}
                    {cardData.doe}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.overall_score', { defaultValue: 'Overall Score' })}:{' '}
                    {cardData.overall_score}
                  </Text>
                  <Text style={styles.dataText}>
                    {t('profile.type', { defaultValue: 'Type' })}: {cardData.type}
                  </Text>
                </ScrollView>
              </Card.Content>
            </Card>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('profile.phoneNumber', { defaultValue: 'Phone Number' })}
            </Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder={t('profile.phone_placeholder', {
                defaultValue: 'Enter your phone number',
              })}
              keyboardType='phone-pad'
              maxLength={10}
            />
            {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
          </View>
        </View>
      </ScrollView>

      {/* Modal for image selection */}
      <Modal visible={modalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('profile.scan_options_title', { defaultValue: 'Select an Option' })}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={takePicture}>
              <Text style={styles.buttonText}>
                {t('profile.take_picture', { defaultValue: 'Take Picture' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.buttonText}>
                {t('profile.choose_gallery', { defaultValue: 'Choose from Gallery' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>
                {t('profile.cancel', { defaultValue: 'Cancel' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for action options */}
      <Modal visible={optionsModalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('profile.scan_options_title', { defaultValue: 'Identity Card Scanned' })}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>
                {t('profile.update_profile', { defaultValue: 'Update Profile' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.buttonText}>
                {t('profile.cancel', { defaultValue: 'Cancel' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {(scanMutation.isLoading || updateMutation.isLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#fff' />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#52c41a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  dataCard: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    padding: 4,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default UpdateUserInfoScan;
