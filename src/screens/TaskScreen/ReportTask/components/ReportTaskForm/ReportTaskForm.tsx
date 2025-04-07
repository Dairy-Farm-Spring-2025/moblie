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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '@config/axios/axios';
import { useMutation } from 'react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  ReportTaskForm: { reportId: string | number };
};

type ReportTaskFormRouteProp = RouteProp<RootStackParamList, 'ReportTaskForm'>;
const { t } = useTranslation();
const ReportTaskForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ReportTaskFormRouteProp>();
  const { reportId } = route.params;

  const [formData, setFormData] = useState<{ description: string; imagesFile: string | null }>({
    description: '',
    imagesFile: null,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('Permission Denied', 'Sorry, we need camera permissions to take pictures!'));
        return false;
      }
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    console.log('Picking image from gallery...');
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      console.log('Image picked:', selectedImage);
      setFormData((prev) => ({ ...prev, imagesFile: selectedImage }));
      setModalVisible(false);
    } else {
      console.log('Image picking canceled');
    }
  };

  const takePicture = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    console.log('Taking picture...');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const capturedImage = result.assets[0].uri;
      console.log('Picture taken:', capturedImage);
      setFormData((prev) => ({ ...prev, imagesFile: capturedImage }));
      setModalVisible(false);
    } else {
      console.log('Picture taking canceled');
    }
  };

  const reportTaskFormMutation = useMutation(
    (data: FormData) => {
      console.log('Sending report task request with FormData:');
      console.log(`URL: /reportTask/create/${reportId}`);
      return apiClient.post(`/reportTask/create/${reportId}`, data);
    },
    {
      onSuccess: (response) => {
        console.log('Report task created successfully:', response.data);
        Alert.alert('Success', 'Task reported successfully!');
        navigation.goBack();
      },
      onError: (error: any) => {
        console.error('Failed to create report task:', error.response?.data || error.message);
        Alert.alert('Error', `Failed to report task: ${error}`);
      },
    }
  );

  const handleSubmit = () => {
    console.log('handleSubmit called with formData:', formData);
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }
    if (!formData.imagesFile) {
      Alert.alert('Error', 'Please upload or capture an image.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('description', formData.description);
    const uriParts = formData.imagesFile.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileData = {
      uri: formData.imagesFile,
      name: `image.reportTask.${fileType}`,
      type: `image/${fileType}`,
    };
    console.log('Appending file:', fileData);
    formDataToSend.append('imagesFile', fileData as any);

    reportTaskFormMutation.mutate(formDataToSend);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('Report Task')} #{reportId}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('Description')}</Text>
        <TextInput
          style={styles.input}
          value={formData.description}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
          placeholder='Enter task description'
          multiline
        />
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.label}>{t('Uploaded/Captured Image')}</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
          <Ionicons name='camera-outline' size={24} color='#fff' />
          <Text style={styles.uploadButtonText}>{t('Add Image')}</Text>
        </TouchableOpacity>
        {formData.imagesFile && (
          <Image source={{ uri: formData.imagesFile }} style={styles.imagePreviewItem} />
        )}
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
          {reportTaskFormMutation.isLoading ? 'Submitting...' : 'Submit Report'}
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
  imagePreviewItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: 'cover',
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
