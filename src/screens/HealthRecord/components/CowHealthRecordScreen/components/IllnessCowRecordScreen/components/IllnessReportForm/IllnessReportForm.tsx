import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import { Cow } from '@model/Cow/Cow';
import { t } from 'i18next';

type RootStackParamList = {
  IllnessReportForm: { cow: Cow };
};

type IllnessReportFormRouteProp = RouteProp<RootStackParamList, 'IllnessReportForm'>;

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

const IllnessReportForm = () => {
  const route = useRoute<IllnessReportFormRouteProp>();
  const navigation = useNavigation();
  const { cow: Cow } = route.params;
  const [symptoms, setSymptoms] = useState<string>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post('/illness/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Report submitted successfully, redirecting...');
      setSymptoms('');
      setImages([]);
      Keyboard.dismiss();
      setTimeout(() => {
        setSuccessMessage('');
        navigation.goBack();
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Error submitting report:', error.response?.data);
      setErrors({ serverError: error.message || 'Something went wrong' });
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!symptoms.trim()) {
      newErrors.symptoms = t('Symptoms are required', { defaultValue: 'Symptoms are required' });
    }
    if (images.length === 0) {
      newErrors.images = t('Please upload or capture at least one image', {
        defaultValue: 'Please upload or capture at least one image',
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permission_denied', { defaultValue: 'Permission Denied' }),
          t('camera_permission_required', { defaultValue: 'Camera permission required' })
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `image_illness_${Date.now()}.${fileType}`;
      setImages((prev) => [
        ...prev,
        {
          uri: selectedImage,
          name: fileName,
          type: `image/${fileType}`,
        },
      ]);
      setModalVisible(false);
    } else {
      Alert.alert('Image picking canceled');
    }
  };

  const takePicture = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const capturedImage = result.assets[0].uri;
      const uriParts = capturedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `image_illness_${Date.now()}.${fileType}`;
      setImages((prev) => [
        ...prev,
        {
          uri: capturedImage,
          name: fileName,
          type: `image/${fileType}`,
        },
      ]);
      setModalVisible(false);
    } else {
      Alert.alert('Picture taking canceled');
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('symptoms', symptoms);
    formData.append('cowId', Cow.cowId.toString());

    images.forEach((image, index) => {
      formData.append('newImages', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    mutation.mutate(formData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TitleNameCows
        title={`${t('illness.report', { defaultValue: 'Report Illness' })} - `}
        cowName={Cow.name.toString()}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {t('illness.report', { defaultValue: 'Report Illness' })}
            </Text>
            {successMessage && <Text style={styles.successText}> {successMessage} </Text>}
            {errors.serverError && <Text style={styles.errorText}> {errors.serverError} </Text>}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t('illness.symptoms', { defaultValue: 'Symptoms' })}
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineTextInput]}
                multiline
                placeholder={t('illness.describe_symptoms', {
                  defaultValue: 'Describe the symptoms in detail...',
                })}
                value={symptoms}
                numberOfLines={5}
                textAlignVertical='top'
                onChangeText={setSymptoms}
              />
              {errors.symptoms && <Text style={styles.errorText}> {errors.symptoms} </Text>}
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.inputLabel}>
                {t('illness.uploaded_images', {
                  defaultValue: 'Uploaded/Captured Images',
                })}
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
                <Ionicons name='camera-outline' size={24} color='#fff' />
                <Text style={styles.uploadButtonText}>
                  {t('illness.add_image', { defaultValue: 'Add Image' })}
                </Text>
              </TouchableOpacity>
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreviewItem} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name='close-circle' size={24} color='red' />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {errors.images && <Text style={styles.errorText}> {errors.images} </Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, mutation.isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={mutation.isLoading}
            >
              <Text style={styles.submitButtonText}>
                {mutation.isLoading
                  ? t('illness.submitting', { defaultValue: 'Submitting...' })
                  : t('illness.submit_report', { defaultValue: 'Submit Report' })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Ionicons name='image-outline' size={30} color='#007bff' />
              <Text style={styles.modalButtonText}>
                {t('profile.pick_from_gallery', {
                  defaultValue: 'Pick from Gallery',
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={takePicture}>
              <Ionicons name='camera' size={30} color='#007bff' />
              <Text style={styles.modalButtonText}>
                {t('profile.take_a_photo', { defaultValue: 'Take a Photo' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t('profile.cancel', { defaultValue: 'Cancel' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {mutation.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size='large' color='#007AFF' />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '700',
    color: '#333',
    fontSize: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginVertical: 10,
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    fontFamily: 'System',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  multilineTextInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginVertical: 5,
  },
  successText: {
    color: 'green',
    marginVertical: 10,
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreviewItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  submitButton: {
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#b7eb8f',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  modalButtonText: {
    fontSize: 18,
    color: '#007bff',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default IllnessReportForm;
