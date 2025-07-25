import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '@config/axios/axios';
import { useMutation } from 'react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { t } from 'i18next';

type RootStackParamList = {
  ReportTaskForm: { reportId: string | number };
};

type ReportTaskFormRouteProp = RouteProp<RootStackParamList, 'ReportTaskForm'>;

const ReportTaskForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ReportTaskFormRouteProp>();
  const { reportId } = route.params;

  const [formData, setFormData] = useState<{
    description: string;
    imagesFile: string[];
  }>({
    description: '',
    imagesFile: [],
  });
  const [modalVisible, setModalVisible] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Permission Denied'),
          t('Sorry, we need camera permissions to take pictures!')
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
      setFormData((prev) => ({
        ...prev,
        imagesFile: [...prev.imagesFile, selectedImage],
      }));
      setModalVisible(false);
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
      setFormData((prev) => ({
        ...prev,
        imagesFile: [...prev.imagesFile, capturedImage],
      }));
      setModalVisible(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagesFile: prev.imagesFile.filter((_, i) => i !== index),
    }));
  };

  const reportTaskFormMutation = useMutation(
    (data: FormData) => {
      return apiClient.post(`/reportTask/create/${reportId}`, data);
    },
    {
      onSuccess: (response) => {
        Alert.alert(
          t('Success'),
          t('task_management.report_task_success', { defaultValue: 'Task reported successfully!' })
        );
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), `Failed to report task: ${error.response?.data?.message}`);
      },
    }
  );

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert(t('Error'), 'Please enter a description.');
      return;
    }
    if (formData.imagesFile.length === 0) {
      Alert.alert(t('Error'), 'Please upload or capture at least one image.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('description', formData.description);

    formData.imagesFile.forEach((imageUri, index) => {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileData = {
        uri: imageUri,
        name: `image.reportTask.${index}.${fileType}`,
        type: `image/${fileType}`,
      };
      formDataToSend.append('imagesFile', fileData as any);
    });

    reportTaskFormMutation.mutate(formDataToSend);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {t('Report Task')} #{reportId}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Description')}</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              placeholder={t('Enter task description')}
              multiline
            />
          </View>

          <View style={styles.imageContainer}>
            <Text style={styles.label}>{t('Uploaded/Captured Images')}</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
              <Ionicons name='camera-outline' size={24} color='#fff' />
              <Text style={styles.uploadButtonText}>{t('Add Image')}</Text>
            </TouchableOpacity>
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {formData.imagesFile.map((imageUri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreviewItem} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                    <Ionicons name='close-circle' size={24} color='red' />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              reportTaskFormMutation.isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={reportTaskFormMutation.isLoading}
          >
            <Text style={styles.submitButtonText}>
              {reportTaskFormMutation.isLoading ? 'Submitting...' : t('Submit Report')}
            </Text>
          </TouchableOpacity>

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
                  <Text style={styles.modalButtonText}>{t('Pick from Gallery')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={takePicture}>
                  <Ionicons name='camera' size={30} color='#007bff' />
                  <Text style={styles.modalButtonText}>{t('Take a Photo')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
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
});

export default ReportTaskForm;
