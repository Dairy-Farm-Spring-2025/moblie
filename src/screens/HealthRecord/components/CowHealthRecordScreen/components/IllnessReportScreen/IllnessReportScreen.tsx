import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { t } from 'i18next';
import { useMutation, useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import CardCow from '@components/CardCow/CardCow';
import { Cow } from '@model/Cow/Cow';
import { IllnessSeverity } from '@model/Illness/enums/IllnessSeverity';
import { InjectionSite } from '@model/Illness/enums/InjectionSite';
import { IllnessReportRequest, TreatmentDetail } from '@model/Illness/Request/IllnessCreate';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native-paper';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getVietnamISOString } from '@utils/format';

type RootStackParamList = {
  IllnessReportScreen: { cow: Cow };
};

type IllnessReportScreenRouteProp = RouteProp<RootStackParamList, 'IllnessReportScreen'>;

interface CategoryEntity {
  categoryId: number;
  name: string;
}

interface WarehouseLocationEntity {
  warehouseLocationId: number;
  name: string;
  description: string;
  type: string;
}

interface Item {
  itemId: number;
  name: string;
  description: string;
  status: string;
  unit: string;
  categoryEntity: CategoryEntity;
  warehouseLocationEntity: WarehouseLocationEntity;
}

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

const fetchVaccines = async (): Promise<Item[]> => {
  const response = await apiClient.get('/items/vaccine');
  return response.data;
};

const IllnessReportScreen = () => {
  const route = useRoute<IllnessReportScreenRouteProp>();
  const navigation = useNavigation();
  const cow = route.params.cow;

  const [formData, setFormData] = useState<IllnessReportRequest>({
    symptoms: '',
    severity: IllnessSeverity.none,
    prognosis: '',
    cowId: cow.cowId,
    detail: [
      {
        dosage: 0,
        injectionSite: InjectionSite.leftArm,
        date: getVietnamISOString().split('T')[0],
        description: '',
        vaccineId: 0,
      },
    ],
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate } = useMutation(
    async (formDataToSend: FormData) => {
      const res = await apiClient.post('/illness/create', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('res.data', res.data);
      return res.data;
    },
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message || 'Illness report created successfully');
        navigation.navigate('Home' as never);
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response?.data?.message || 'Failed to create illness report');
      },
    }
  );

  const {
    data: vaccines,
    isLoading,
    isError,
  } = useQuery('vaccines', fetchVaccines, {
    onError: (error) => {
      console.error('Error fetching vaccines:', error);
    },
  });

  const vaccineOptions: Option[] = vaccines
    ? vaccines.map((vaccine) => ({
        label: vaccine.name,
        value: vaccine.itemId.toString(),
      }))
    : [];

  const severityOptions: Option[] = Object.values(IllnessSeverity).map((severity) => ({
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: severity,
  }));

  const injectionSiteOptions: Option[] = Object.values(InjectionSite).map((site) => ({
    label: site
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: site,
  }));

  const handleInputChange = (field: keyof IllnessReportRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDetailChange = (field: keyof TreatmentDetail, value: any) => {
    setFormData((prev) => ({
      ...prev,
      detail: [{ ...prev.detail[0], [field]: value }],
    }));
    // Clear error for this field
    if (errors[`detail_${field}`]) {
      setErrors((prev) => ({ ...prev, [`detail_${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = t('illness_report.symptoms_required', {
        defaultValue: 'Symptoms are required',
      });
    }
    if (formData.severity === IllnessSeverity.none) {
      newErrors.severity = t('illness_report.severity_required', {
        defaultValue: 'Severity is required',
      });
    }
    if (!formData.prognosis.trim()) {
      newErrors.prognosis = t('illness_report.prognosis_required', {
        defaultValue: 'Prognosis is required',
      });
    }
    if (formData.detail[0].dosage <= 0) {
      newErrors.detail_dosage = t('illness_report.dosage_required', {
        defaultValue: 'Dosage must be greater than 0',
      });
    }
    if (!formData.detail[0].date.trim()) {
      newErrors.detail_date = t('illness_report.date_required', {
        defaultValue: 'Treatment date is required',
      });
    }
    if (!formData.detail[0].description.trim()) {
      newErrors.detail_description = t('illness_report.description_required', {
        defaultValue: 'Treatment description is required',
      });
    }
    if (formData.detail[0].vaccineId === 0) {
      newErrors.detail_vaccineId = t('illness_report.vaccine_required', {
        defaultValue: 'Vaccine/Medication is required',
      });
    }
    if (images.length === 0) {
      newErrors.images = t('illness_report.images_required', {
        defaultValue: 'At least one image is required',
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
    console.log('Picking image from gallery...');
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
      console.log('Image picked:', selectedImage);
      setImages((prev) => [
        ...prev,
        {
          uri: selectedImage,
          name: fileName,
          type: `image/${fileType}`,
        },
      ]);
      setModalVisible(false);
      // Clear images error if present
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: '' }));
      }
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
      const uriParts = capturedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `image_illness_${Date.now()}.${fileType}`;
      console.log('Picture taken:', capturedImage);
      setImages((prev) => [
        ...prev,
        {
          uri: capturedImage,
          name: fileName,
          type: `image/${fileType}`,
        },
      ]);
      setModalVisible(false);
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: '' }));
      }
    } else {
      console.log('Picture taking canceled');
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('symptoms', formData.symptoms as any);
    formDataToSend.append('severity', formData.severity as any);
    formDataToSend.append('prognosis', formData.prognosis as any);
    formDataToSend.append('cowId', formData.cowId.toString());
    formDataToSend.append('detail[0].dosage', formData.detail[0].dosage as any);
    formDataToSend.append('detail[0].injectionSite', formData.detail[0].injectionSite);
    formDataToSend.append('detail[0].date', formData.detail[0].date);
    formDataToSend.append('detail[0].description', formData.detail[0].description);
    formDataToSend.append('detail[0].vaccineId', formData.detail[0].vaccineId as any);

    images.forEach((image, index) => {
      formDataToSend.append('newImages', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    console.log('Form data to send:', formDataToSend);

    mutate(formDataToSend);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {t('illness_report.report_illness', { defaultValue: 'Illness Report' })}
            </Text>

            <CardCow cow={cow} onPress={() => console.log('Cow card pressed')} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.symptoms', { defaultValue: 'Symptoms' })}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.symptoms}
                onChangeText={(text) => handleInputChange('symptoms', text)}
                placeholder={t('illness_report.symptoms_placeholder', {
                  defaultValue: 'Enter symptoms (e.g., Fever, lethargy)',
                })}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.severity', { defaultValue: 'Severity' })}
              </Text>
              <CustomPicker
                options={severityOptions}
                selectedValue={formData.severity}
                onValueChange={(value) => handleInputChange('severity', value as IllnessSeverity)}
                title={t('illness_report.select_severity', {
                  defaultValue: 'Select severity...',
                })}
              />
              {errors.severity && <Text style={styles.errorText}>{errors.severity}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.prognosis', { defaultValue: 'Prognosis' })}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.prognosis}
                onChangeText={(text) => handleInputChange('prognosis', text)}
                placeholder={t('illness_report.prognosis_placeholder', {
                  defaultValue: 'Enter prognosis (e.g., Expected recovery in 7-10 days)',
                })}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.dosage', { defaultValue: 'Dosage (mL or mg)' })}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.detail[0].dosage.toString()}
                onChangeText={(text) => handleDetailChange('dosage', Number(text))}
                placeholder={t('illness_report.dosage_placeholder', {
                  defaultValue: 'Enter dosage',
                })}
                keyboardType='numeric'
              />
              {errors.detail_dosage && <Text style={styles.errorText}>{errors.detail_dosage}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.injection_site', { defaultValue: 'Injection Site' })}
              </Text>
              <CustomPicker
                options={injectionSiteOptions}
                selectedValue={formData.detail[0].injectionSite}
                onValueChange={(value) =>
                  handleDetailChange('injectionSite', value as InjectionSite)
                }
                title={t('illness_report.select_injection_site', {
                  defaultValue: 'Select injection site...',
                })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.treatment_date', { defaultValue: 'Treatment Date' })}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.detail[0].date}
                onChangeText={(text) => handleDetailChange('date', text)}
                placeholder={t('illness_report.date_placeholder', {
                  defaultValue: 'Enter date (YYYY-MM-DD)',
                })}
                editable={false}
              />
              {errors.detail_date && <Text style={styles.errorText}>{errors.detail_date}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.vaccine', { defaultValue: 'Vaccine/Medication' })}
              </Text>
              {isLoading ? (
                <Text style={styles.loadingText}>
                  {t('illness_report.loading', { defaultValue: 'Loading vaccines...' })}
                </Text>
              ) : isError ? (
                <Text style={styles.errorText}>
                  {t('illness_report.error', { defaultValue: 'Error loading vaccines' })}
                </Text>
              ) : (
                <CustomPicker
                  options={vaccineOptions}
                  selectedValue={formData.detail[0].vaccineId.toString()}
                  onValueChange={(value) => handleDetailChange('vaccineId', Number(value))}
                  title={t('illness_report.select_vaccine', {
                    defaultValue: 'Select vaccine...',
                  })}
                />
              )}
              {errors.detail_vaccineId && (
                <Text style={styles.errorText}>{errors.detail_vaccineId}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('illness_report.treatment_description', {
                  defaultValue: 'Treatment Description',
                })}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.detail[0].description}
                onChangeText={(text) => handleDetailChange('description', text)}
                placeholder={t('illness_report.description_placeholder', {
                  defaultValue: 'Enter treatment description',
                })}
                multiline
              />
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.label}>
                {t('illness_report.uploaded_images', {
                  defaultValue: 'Uploaded/Captured Images',
                })}
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
                <Ionicons name='camera-outline' size={24} color='#fff' />
                <Text style={styles.uploadButtonText}>
                  {t('illness_report.add_image', { defaultValue: 'Add Image' })}
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
              {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {t('illness_report.submit_report', { defaultValue: 'Submit Report' })}
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
                {t('illness_report.pick_from_gallery', {
                  defaultValue: 'Pick from Gallery',
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={takePicture}>
              <Ionicons name='camera' size={30} color='#007bff' />
              <Text style={styles.modalButtonText}>
                {t('illness_report.take_a_photo', { defaultValue: 'Take a Photo' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t('illness_report.cancel', { defaultValue: 'Cancel' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
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
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 5,
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

export default IllnessReportScreen;
