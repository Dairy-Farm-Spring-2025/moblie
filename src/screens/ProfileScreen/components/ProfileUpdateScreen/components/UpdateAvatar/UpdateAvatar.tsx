import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from 'react-query';
import apiClient from '@config/axios/axios';
import { useTranslation } from 'react-i18next';
import { getAvatar } from '@utils/getImage';
import { t } from 'i18next';

interface UpdateAvatarProps {
  profilePhoto?: string;
}

const UpdateAvatar: React.FC<UpdateAvatarProps> = ({ profilePhoto }) => {
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const mutation = useMutation(
    async (formData: FormData) => {
      const response = await apiClient.put('/users/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users/profile');
        Alert.alert(t('profile.update_success'), t('profile.update_success'));
      },
      onError: (error: any) => {
        Alert.alert(
          t('profile.update_error'),
          error.response?.data?.message || t('profile.update_error')
        );
      },
    }
  );

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission_denied'), t('camera_permission_required'));
      return false;
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
      setImage(selectedImage);
      setModalVisible(false);

      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('imageAvatar', {
        uri: selectedImage,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      mutation.mutate(formData);
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
      setImage(capturedImage);
      setModalVisible(false);

      const uriParts = capturedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('imageAvatar', {
        uri: capturedImage,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      mutation.mutate(formData);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={() => setModalVisible(true)}>
        {image || profilePhoto ? (
          <Avatar.Image
            size={150}
            source={{
              uri: image || `${getAvatar(profilePhoto || '')}`,
            }}
          />
        ) : (
          <Avatar.Icon size={150} icon='account' />
        )}
        <Avatar.Icon size={40} icon='camera' style={styles.cameraIcon} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button mode='contained' onPress={takePicture} style={styles.modalButton}>
              {t('profile.take_picture')}
            </Button>
            <Button mode='contained' onPress={pickImage} style={styles.modalButton}>
              {t('profile.choose_gallery')}
            </Button>
            <Button mode='text' onPress={() => setModalVisible(false)} style={styles.modalButton}>
              {t('profile.cancel')}
            </Button>
          </View>
        </View>
      </Modal>

      {mutation.isLoading && (
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
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalButton: {
    marginVertical: 5,
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
});

export default UpdateAvatar;
