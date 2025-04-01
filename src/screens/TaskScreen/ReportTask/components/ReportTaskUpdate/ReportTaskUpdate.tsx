import { ReportTaskData } from '@model/Task/Task';
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Alert, Modal, Platform, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Divider, Text, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getReportImage } from '@utils/getImage';

const ReportTaskUpdateContent: React.FC<{
  report: ReportTaskData;
  onUpdate: (description: string, taskFile: string | null) => void;
  isUpdating: boolean;
}> = ({ report, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState<{ description: string; taskFile: string | null }>({
    description: report.description || '',
    taskFile: report.reportImages?.[0].url || null,
  });
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take pictures!');
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
      setFormData((prev) => ({ ...prev, taskFile: selectedImage }));
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
      setFormData((prev) => ({ ...prev, taskFile: capturedImage }));
      setImageModalVisible(false);
    }
  };

  const handleUpdateSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }
    onUpdate(formData.description, formData.taskFile);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Update Report #{report.reportTaskId}</Text>

      <View style={styles.inputSection}>
        <View style={styles.inputLabelRow}>
          <Ionicons name='document-text-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>Description:</Text>
        </View>
        <TextInput
          style={styles.input}
          value={formData.description}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
          placeholder='Enter task description'
          multiline
        />
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputLabelRow}>
          <Ionicons name='image-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>Image:</Text>
        </View>
        <View style={styles.imageUpdateContainer}>
          {formData.taskFile && (
            <Image
              source={{ uri: getReportImage(formData.taskFile) }}
              style={styles.imagePreviewItem}
            />
          )}
          <Divider style={{ margin: 10 }} />
          <TouchableOpacity style={styles.uploadButton} onPress={() => setImageModalVisible(true)}>
            <Ionicons name='camera-outline' size={24} color='#fff' />
            <Text style={styles.uploadButtonText}>Add Image</Text>
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
            {isUpdating ? 'Updating...' : 'Update Report'}
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
              <Text style={styles.modalButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={takePicture}>
              <Ionicons name='camera' size={30} color='#007bff' />
              <Text style={styles.modalButtonText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    fontSize: 34,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1,
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
    marginBottom: 20,
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
  imagePreviewItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default ReportTaskUpdateContent;
