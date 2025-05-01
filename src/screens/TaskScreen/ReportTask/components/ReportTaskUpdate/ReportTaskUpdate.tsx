import { ReportTaskData } from '@model/Task/Task';
import React, { useState } from 'react';
import { Image, StyleSheet, ScrollView } from 'react-native';
import { Alert, Modal, Platform, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Divider, Text, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getReportImage } from '@utils/getImage';
import { t } from 'i18next';

type FileData = {
  uri: string;
  name: string;
  type: string;
} | null;

const ReportTaskUpdateContent: React.FC<{
  report: ReportTaskData;
  onUpdate: (description: string, deleteUrls: string[], newImage: FileData) => void;
  isUpdating: boolean;
}> = ({ report, onUpdate, isUpdating }) => {
  const initialImages = report.reportImages?.map((img) => img.url) || [];

  const [formData, setFormData] = useState<{
    description: string;
    existingImages: string[];
    newImages: string[];
    deleteUrls: string[];
  }>({
    description: report.description || '',
    existingImages: initialImages,
    newImages: [],
    deleteUrls: [],
  });
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, selectedImage],
      }));
      setImageModalVisible(false);
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
        newImages: [...prev.newImages, capturedImage],
      }));
      setImageModalVisible(false);
    }
  };

  const handleUpdateSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert(t('Error'), 'Please enter a description.');
      return;
    }

    // For simplicity, we'll send only the first new image (if any) to match the API's current expectation
    // If the API supports multiple new images, you can adjust the parent component accordingly
    let fileData: FileData = null;
    if (formData.newImages.length > 0) {
      const firstNewImage = formData.newImages[0];
      const uriParts = firstNewImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      fileData = {
        uri: firstNewImage,
        name: `image.reportTask.${fileType}`,
        type: `image/${fileType}`,
      };
    }

    onUpdate(formData.description, formData.deleteUrls, fileData);
  };

  const openImageReview = (imageUri: string) => {
    setSelectedImage(imageUri);
    setReviewModalVisible(true);
  };

  const removeImage = (imageUri: string, isExisting: boolean) => {
    if (isExisting) {
      // Extract the file name from the image URL
      const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      // Construct the deleteUrl in the required format
      const deleteUrl = `https://api.dairyfarmfpt.website/uploads/reportTasks/${fileName}`;
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((uri) => uri !== imageUri),
        deleteUrls: [...prev.deleteUrls, deleteUrl],
      }));
    } else {
      // Remove from newImages
      setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((uri) => uri !== imageUri),
      }));
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {t('Update Report')} #{report.reportTaskId}
      </Text>

      <View style={styles.inputSection}>
        <View style={styles.inputLabelRow}>
          <Ionicons name='document-text-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('Description')}:</Text>
        </View>
        <TextInput
          style={styles.input}
          value={formData.description}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
          placeholder={t('Enter task description')}
          multiline
        />
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputLabelRow}>
          <Ionicons name='image-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('Images')}:</Text>
        </View>
        <View style={styles.imageUpdateContainer}>
          {formData.existingImages.length === 0 && formData.newImages.length === 0 ? (
            <Text style={styles.noImageText}>{t('No images available')}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Display existing images */}
              {formData.existingImages.map((imageUri, index) => (
                <View key={`existing-${index}`} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity onPress={() => openImageReview(imageUri)}>
                    <Image
                      source={{ uri: getReportImage(imageUri) }}
                      style={styles.imagePreviewItem}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(imageUri, true)}
                  >
                    <Ionicons name='close-circle' size={24} color='#ff4d4f' />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Display new images */}
              {formData.newImages.map((imageUri, index) => (
                <View key={`new-${index}`} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity onPress={() => openImageReview(imageUri)}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreviewItem} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(imageUri, false)}
                  >
                    <Ionicons name='close-circle' size={24} color='#ff4d4f' />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <Divider style={{ margin: 10 }} />
          <TouchableOpacity style={styles.uploadButton} onPress={() => setImageModalVisible(true)}>
            <Ionicons name='camera-outline' size={24} color='#fff' />
            <Text style={styles.uploadButtonText}>{t('Add Image')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
          onPress={handleUpdateSubmit}
          disabled={isUpdating}
        >
          <Ionicons name='checkmark-done' size={24} color='#fff' />
          <Text style={styles.updateButtonText}>
            {isUpdating ? 'Updating...' : t('Update Report')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Selection Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
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
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Review Modal */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.reviewModalContainer}>
          <View style={styles.reviewModalContent}>
            {selectedImage && (
              <Image
                source={{
                  uri: selectedImage.startsWith('file://')
                    ? selectedImage
                    : getReportImage(selectedImage),
                }}
                style={styles.reviewImage}
                resizeMode='contain'
              />
            )}
            <TouchableOpacity
              style={styles.closeReviewButton}
              onPress={() => setReviewModalVisible(false)}
            >
              <Ionicons name='close' size={30} color='#fff' />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  segmentedButtons: {
    margin: 10,
  },
  scrollContent: {
    padding: 10,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1,
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  inputSection: {
    marginVertical: 20,
    width: '100%',
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 30,
    marginRight: 10,
  },
  textLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tag: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  tagText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    flexDirection: 'row',
    flexShrink: 1,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageUpdateContainer: {
    alignItems: 'flex-start',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginTop: 20,
    marginRight: 10,
  },
  imagePreviewItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  noImageText: {
    fontSize: 14,
    color: '#595959',
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  updateButtonDisabled: {
    backgroundColor: '#b7eb8f',
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  reviewModalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },
  closeReviewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
});

export default ReportTaskUpdateContent;
