import apiClient from '@config/axios/axios';
import { User } from '@model/User/User';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, Avatar, Divider } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';

const fetchProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextOld, setSecureTextOld] = useState(true);
  const [secureTextNew, setSecureTextNew] = useState(true);
  const [secureTextConfirm, setSecureTextConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Access the navigation object

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery<User>('users/profile', fetchProfile);

  const mutation = useMutation(
    async (data: any) => await apiClient.put('/users/changepassword', data),
    {
      onSuccess: (response) => {
        Alert.alert('Success', 'Password changed successfully');
        console.log(response);
        navigation.goBack();
      },
      onError: (error) => {
        Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
      },
    }
  );
  const { t } = useTranslation();
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Error', 'New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    setLoading(true);
    mutation.mutate(
      { oldPassword, newPassword, confirmedPassword: confirmPassword },
      {
        onSettled: () => setLoading(false),
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profileData?.profilePhoto ? (
            <Avatar.Image
              size={150}
              source={{
                uri: `http://34.124.196.11:8080/uploads/users/${profileData.profilePhoto}`,
              }}
            />
          ) : (
            <Avatar.Icon size={150} icon='account' />
          )}
          <Avatar.Icon size={40} icon='camera' style={styles.cameraIcon} />
        </View>
        <Text variant='headlineMedium' style={styles.fullName}>
          {profileData?.name || 'N/A'}
        </Text>
        <Text variant='bodyMedium' style={styles.role}>
          {profileData?.roleId?.name || 'No Role'}
        </Text>
      </View>
      <Divider style={{ marginVertical: 10 }} />
      <Text style={styles.title}>{t('Change Your Password')}</Text>

      <TextInput
        label='Old Password'
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry={secureTextOld}
        mode='outlined'
        autoCapitalize='none'
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={secureTextOld ? 'eye-off' : 'eye'}
            onPress={() => setSecureTextOld(!secureTextOld)}
          />
        }
        style={styles.input}
      />

      <TextInput
        label='New Password'
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={secureTextNew}
        mode='outlined'
        autoCapitalize='none'
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={secureTextNew ? 'eye-off' : 'eye'}
            onPress={() => setSecureTextNew(!secureTextNew)}
          />
        }
        style={styles.input}
      />
      <HelperText type='error' visible={newPassword.length > 0 && newPassword.length < 6}>
        {t('Password must be at least 6 characters')}
      </HelperText>

      <TextInput
        label='Confirm New Password'
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={secureTextConfirm}
        mode='outlined'
        autoCapitalize='none'
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={secureTextConfirm ? 'eye-off' : 'eye'}
            onPress={() => setSecureTextConfirm(!secureTextConfirm)}
          />
        }
        style={styles.input}
      />
      <HelperText type='error' visible={confirmPassword !== '' && confirmPassword !== newPassword}>
        {t('Passwords do not match')}
      </HelperText>

      <Button
        mode='contained'
        onPress={handleChangePassword}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        {t('Update Password')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default ChangePasswordScreen;
