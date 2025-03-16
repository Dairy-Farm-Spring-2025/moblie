import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { TextInput, Button, Text, Avatar, RadioButton } from 'react-native-paper';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import Dropdown from '@components/Dropdown/Dropdown';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';

interface FormDataType {
  name: string;
  phoneNumber: string;
  address: string;
  dob: string;
  gender: string;
}

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const ProfileUpdateScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  const mutation = useMutation(
    async (formData: FormData) => {
      const response = await apiClient.put('/users/update', formData);
      console.log(response);
      return response.data;
    },
    {
      onSuccess: (response) => {
        console.log('response', response.data);
        Alert.alert('Success', 'Profile updated successfully');
      },
      onError: (error: any) =>
        Alert.alert('Error', error.response?.data?.message || 'Failed to update profile'),
    }
  );

  const handleUpdateProfile = async (): Promise<void> => {
    if (!name || !phoneNumber || !address || !dob || !gender) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phoneNumber', phoneNumber);
    formData.append('address', address);
    formData.append('dob', dob);
    formData.append('gender', gender);

    mutation.mutate(formData);
  };

  return (
    <ScrollView>
      <TitleNameCows title='Update Your Profile' cowName='' />
      <View style={styles.container}>
        <TextInput label='Name' value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          label='Phone Number'
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType='phone-pad'
          style={styles.input}
        />
        <TextInput label='Address' value={address} onChangeText={setAddress} style={styles.input} />
        <TextInput
          label='Date of Birth'
          value={dob}
          onChangeText={setDob}
          placeholder='YYYY-MM-DD'
          style={styles.input}
        />

        <Dropdown
          data={genderOptions}
          onChange={(item) => setGender(item.value)}
          placeholder='Select Gender'
        />

        <Button
          mode='contained'
          onPress={handleUpdateProfile}
          style={styles.button}
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
        >
          Update Profile
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: 140,
    padding: 20,
    justifyContent: 'center',
  },
  avatarWrapper: {
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
  radioButtonItem: {
    paddingVertical: 5,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  genderContainer: {
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  genderText: {
    marginLeft: 10,
    fontSize: 16,
  },
  genderLabel: {
    marginBottom: 5,
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
});

export default ProfileUpdateScreen;
