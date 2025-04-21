import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'react-query';
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

interface IdentityCardUpdateProps {
  initialData?: IdentityCardData;
}

const IdentityCardUpdate: React.FC<IdentityCardUpdateProps> = ({ initialData }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [cardData, setCardData] = useState<IdentityCardData | null>(initialData || null);
  const [scannedData, setScannedData] = useState<IdentityCardData | null>(null);

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
          setOptionsModalVisible(true); // Show options modal
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
        setCardData(scannedData); // Update UI with scanned data
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

  // Handle confirm action (keep scanned data)
  const handleConfirm = () => {
    setCardData(scannedData);
    setOptionsModalVisible(false);
    Alert.alert(
      t('profile.identity_scan_success', { defaultValue: 'Identity card scanned successfully' }),
      t('profile.identity_scan_success_message', { defaultValue: 'Data extracted successfully' })
    );
  };

  // Handle update profile action
  const handleUpdateProfile = () => {
    if (!scannedData) return;

    const formData: FormDataType = {
      name: scannedData.name,
      phoneNumber: '', // Note: Not provided in scan data; handle as needed
      address: scannedData.address,
      dob: convertToYYYYMMDD(scannedData.dob),
      gender: normalizeGender(scannedData.sex),
    };

    updateMutation.mutate(formData);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {cardData ? (
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
                  {t('profile.date_of_expiry', { defaultValue: 'Date of Expiry' })}: {cardData.doe}
                </Text>
                <Text style={styles.dataText}>
                  {t('profile.overall_score', { defaultValue: 'Overall Score' })}:{' '}
                  {cardData.overall_score}
                </Text>
                <Text style={styles.dataText}>
                  {t('profile.type', { defaultValue: 'Type' })}: {cardData.type}
                </Text>
              </ScrollView>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                  {t('profile.upload_identity_card', { defaultValue: 'Upload Identity Card' })}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Modal for image selection */}
      <Modal visible={modalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button mode='contained' onPress={takePicture} style={styles.modalButton}>
              {t('profile.take_picture', { defaultValue: 'Take Picture' })}
            </Button>
            <Button mode='contained' onPress={pickImage} style={styles.modalButton}>
              {t('profile.choose_gallery', { defaultValue: 'Choose from Gallery' })}
            </Button>
            <Button mode='text' onPress={() => setModalVisible(false)} style={styles.modalButton}>
              {t('profile.cancel', { defaultValue: 'Cancel' })}
            </Button>
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
            <Button mode='contained' onPress={handleConfirm} style={styles.modalButton}>
              {t('profile.confirm_scan', { defaultValue: 'Confirm Data' })}
            </Button>
            <Button mode='contained' onPress={handleUpdateProfile} style={styles.modalButton}>
              {t('profile.update_profile', { defaultValue: 'Update Profile' })}
            </Button>
            <Button
              mode='text'
              onPress={() => setOptionsModalVisible(false)}
              style={styles.modalButton}
            >
              {t('profile.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </View>
        </View>
      </Modal>

      {(scanMutation.isLoading || updateMutation.isLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  card: {
    width: 360,
    height: 320,
    borderRadius: 10,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    padding: 4,
  },
  dataText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  placeholder: {
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    marginVertical: 5,
    width: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
});

export default IdentityCardUpdate;
