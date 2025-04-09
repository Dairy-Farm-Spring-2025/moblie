import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@core/store/store';
import { Avatar, Text, Button, Divider, List, Badge } from 'react-native-paper';
import Layout from '@components/layout/Layout';
import { logout } from '@core/store/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { User } from '@model/User/User';
import { getAvatar } from '@utils/getImage';
import { convertToDDMMYYYY } from '@utils/format';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import vietnam from '@assets/vietnam.png'; // Adjust the path based on your folder structure
import us from '@assets/us.png'; // Adjust the path based on your folder structure

const fetchProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation();

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery<User>('users/profile', fetchProfile);

  const [image, setImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const mutation = useMutation(
    async (formData: FormData) => {
      const response = await apiClient.put('/users/update', formData);
      return response.data;
    },
    {
      onSuccess: () => {
        refetch();
        Alert.alert(t('profile.update_success'), t('profile.update_success'));
      },
      onError: (error: any) =>
        Alert.alert(
          t('profile.update_error'),
          error.response?.data?.message || t('profile.update_error')
        ),
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

  // Function to change language and save to AsyncStorage
  const changeLanguage = async (lng: string) => {
    try {
      await AsyncStorage.setItem('language', lng); // Save the selected language to AsyncStorage
      i18n.changeLanguage(lng); // Update the language in i18next
    } catch (error) {
      console.error('Error saving language to AsyncStorage:', error);
      Alert.alert(t('error'), t('language_change_error'));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
          <Text>{t('loading')}</Text>
        </View>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <Text>{t('error')}</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Profile Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => setModalVisible(true)}>
              {profileData?.profilePhoto ? (
                <Avatar.Image
                  size={150}
                  source={{
                    uri: `${getAvatar(profileData.profilePhoto)}`,
                  }}
                />
              ) : (
                <Avatar.Icon size={150} icon='account' />
              )}
              <Avatar.Icon size={40} icon='camera' style={styles.cameraIcon} />
            </TouchableOpacity>
            <Text variant='headlineMedium' style={styles.fullName}>
              {profileData?.name || 'N/A'}
            </Text>
            <Text variant='bodyMedium' style={styles.role}>
              {profileData?.roleId?.name || t('no_role')}
            </Text>
            <Badge
              style={[styles.statusBadge, { backgroundColor: isAuthenticated ? 'green' : 'red' }]}
            >
              {isAuthenticated ? t('authenticated') : t('not_authenticated')}
            </Badge>
            {/* Language Selection Buttons */}
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  { borderColor: i18n.language === 'en' ? '#6200ee' : '#ccc' },
                ]}
                onPress={() => changeLanguage('en')}
              >
                <Image style={styles.languageImage} source={us} />

                <Text style={styles.languageText}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  { borderColor: i18n.language === 'vi' ? '#6200ee' : '#ccc' },
                ]}
                onPress={() => changeLanguage('vi')}
              >
                <Image style={styles.languageImage} source={vietnam} />
                <Text style={styles.languageText}>VI</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* User Info */}
          <List.Section>
            <List.Item
              title={t('profile.employee_id', { defaultValue: 'Employee ID' })}
              description={profileData?.employeeNumber || 'N/A'}
              left={() => <List.Icon icon='identifier' />}
            />
            <List.Item
              title={t('profile.phone_number')}
              description={profileData?.phoneNumber || 'N/A'}
              left={() => <List.Icon icon='phone' />}
            />
            <List.Item
              title={t('profile.email')}
              description={profileData?.email || 'N/A'}
              left={() => <List.Icon icon='email' />}
            />
            <List.Item
              title={t('profile.gender')}
              description={profileData?.gender || 'N/A'}
              left={() => <List.Icon icon='gender-male-female' />}
            />
            <List.Item
              title={t('profile.address')}
              description={profileData?.address || 'N/A'}
              left={() => <List.Icon icon='home' />}
            />
            <List.Item
              title={t('profile.date_of_birth')}
              description={profileData?.dob ? convertToDDMMYYYY(profileData.dob) : 'N/A'}
              left={() => <List.Icon icon='calendar' />}
            />
          </List.Section>

          <Divider style={styles.divider} />

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode='contained-tonal'
              onPress={() => (navigation.navigate as any)('ChangePassword')}
              style={styles.button}
            >
              {t('profile.change_password')}
            </Button>
            <Button
              onPress={() => dispatch(logout())}
              mode='outlined'
              textColor='red'
              style={styles.button}
            >
              {t('profile.logout')}
            </Button>
          </View>
        </View>

        {/* Modal for image selection */}
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
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  languageImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullName: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
  },
  statusBadge: {
    marginTop: 5,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  divider: {
    marginVertical: 15,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    marginBottom: 10,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  languageText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
