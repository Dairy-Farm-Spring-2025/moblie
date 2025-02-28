import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
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

const fetchProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const ProfileScreen: React.FC = () => {
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
        Alert.alert('Success', 'Profile updated successfully');
      },
      onError: (error: any) =>
        Alert.alert('Error', error.response?.data?.message || 'Failed to update profile'),
    }
  );

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

  if (isLoading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
          <Text>Loading profile...</Text>
        </View>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <Text>Error loading profile. Please try again.</Text>
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
              {profileData?.roleId?.name || 'No Role'}
            </Text>
            <Badge
              style={[styles.statusBadge, { backgroundColor: isAuthenticated ? 'green' : 'red' }]}
            >
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </View>

          <Divider style={styles.divider} />

          {/* User Info */}
          <List.Section>
            <List.Item
              title='User ID'
              description={profileData?.id || 'N/A'}
              left={() => <List.Icon icon='identifier' />}
            />
            <List.Item
              title='Phone Number'
              description={profileData?.phoneNumber || 'N/A'}
              left={() => <List.Icon icon='phone' />}
            />
            <List.Item
              title='Email'
              description={profileData?.email || 'N/A'}
              left={() => <List.Icon icon='email' />}
            />
            <List.Item
              title='Gender'
              description={profileData?.gender || 'N/A'}
              left={() => <List.Icon icon='gender-male-female' />}
            />
            <List.Item
              title='Address'
              description={profileData?.address || 'N/A'}
              left={() => <List.Icon icon='home' />}
            />
            <List.Item
              title='Date of Birth'
              description={profileData?.dob ? convertToDDMMYYYY(profileData.dob) : 'N/A'}
              left={() => <List.Icon icon='calendar' />}
            />
          </List.Section>

          <Divider style={styles.divider} />

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode='contained'
              style={styles.button}
              onPress={() => (navigation.navigate as any)('UpdateInfo')}
            >
              Edit Profile
            </Button>
            <Button
              mode='contained-tonal'
              onPress={() => (navigation.navigate as any)('ChangePassword')}
              style={styles.button}
            >
              Change Password
            </Button>
            <Button
              onPress={() => dispatch(logout())}
              mode='outlined'
              textColor='red'
              style={styles.button}
            >
              Logout
            </Button>
          </View>
        </View>

        {/* Modal for image selection */}
        <Modal visible={modalVisible} transparent animationType='slide'>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Button mode='contained' onPress={pickImage} style={styles.modalButton}>
                Choose from Gallery
              </Button>
              <Button mode='text' onPress={() => setModalVisible(false)} style={styles.modalButton}>
                Cancel
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
});

export default ProfileScreen;
