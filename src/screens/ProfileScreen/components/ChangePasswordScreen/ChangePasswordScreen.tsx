import apiClient from '@config/axios/axios';
import { User } from '@model/User/User';
import { useNavigation } from '@react-navigation/native';
import { getAvatar } from '@utils/getImage';
import { t } from 'i18next';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, HelperText, Avatar, Divider } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';

const fetchProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error: any) {
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
  const navigation = useNavigation();

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
        Alert.alert(
          t('Success'),
          t('Password changed successfully', { defaultValue: 'Password changed successfully' })
        );
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert(
          t('Error'),
          error.response?.data?.message ||
            t('Failed to change password', { defaultValue: 'Failed to change password' })
        );
      },
    }
  );

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert(
        t('Error'),
        t('Please fill in all fields.', { defaultValue: 'Please fill in all fields.' })
      );
    }
    if (newPassword.length < 6) {
      return Alert.alert(
        t('Error'),
        t('New password must be at least 6 characters', {
          defaultValue: 'New password must be at least 6 characters',
        })
      );
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert(
        'Error',
        t('Passwords do not match', { defaultValue: 'Passwords do not match' })
      );
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps='handled'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                {profileData?.profilePhoto ? (
                  <Avatar.Image
                    size={150}
                    source={{
                      uri: `${getAvatar(profileData?.profilePhoto)}`,
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
                {t(`home.${profileData?.roleId.name.toLowerCase()}`) || 'No Role'}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.title}>{t('Change Your Password')}</Text>

            <TextInput
              label={t('Old Password', { defaultValue: 'Old Password' })}
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
              label={t('New Password', { defaultValue: 'New Password' })}
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
              label={t('Confirm Password', { defaultValue: 'Confirm Password' })}
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
            <HelperText
              type='error'
              visible={confirmPassword !== '' && confirmPassword !== newPassword}
            >
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
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Extra padding to ensure button is accessible
  },
  container: {
    flex: 1,
    padding: 20,
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
  divider: {
    marginVertical: 10,
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
    marginBottom: 20,
  },
});

export default ChangePasswordScreen;
