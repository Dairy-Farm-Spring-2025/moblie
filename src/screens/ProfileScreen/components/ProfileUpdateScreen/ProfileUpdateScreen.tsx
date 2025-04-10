import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import { t } from 'i18next';
import { profileApi } from '@services/Profile/profileApi';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { User } from '@model/User/User';

interface FormDataType {
  name: string;
  phoneNumber: string;
  address: string;
  dob: string; // Sent in YYYY-MM-DD format
  gender: string;
}

const genderOptions: Option[] = [
  { label: t('profile.male', { defaultValue: 'Male' }), value: 'male' },
  { label: t('profile.female', { defaultValue: 'Female' }), value: 'female' },
];

type RootStackParamList = {
  ProfileUpdateScreen: { profile: User };
};

type ProfileUpdateScreenRouteProp = RouteProp<RootStackParamList, 'ProfileUpdateScreen'>;

const ProfileUpdateScreen: React.FC = () => {
  const route = useRoute<ProfileUpdateScreenRouteProp>();
  const user = route.params.profile;
  const navigation = useNavigation();
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [dob, setDob] = useState<string>(''); // Stored as DD-MM-YYYY
  const [gender, setGender] = useState<string>('');
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [districtOptions, setDistrictOptions] = useState<Option[]>([]);
  const [wardOptions, setWardOptions] = useState<Option[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false); // Toggle edit mode

  // Format DOB to DD-MM-YYYY for input
  const formatDob = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.substring(0, 2); // Day
    if (cleaned.length > 2) formatted += '-' + cleaned.substring(2, 4); // Month
    if (cleaned.length > 4) formatted += '-' + cleaned.substring(4, 8); // Year
    return formatted.substring(0, 10);
  };

  // Parse YYYY-MM-DD to DD-MM-YYYY for display
  const parseDobToDisplayFormat = (dob: string): string => {
    const [year, month, day] = dob.split('-');
    return `${day}-${month}-${year}`; // Convert to DD-MM-YYYY
  };

  // Parse DD-MM-YYYY to YYYY-MM-DD for API
  const parseDobToApiFormat = (dob: string): string => {
    const [day, month, year] = dob.split('-');
    return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
  };

  const handleDobChange = (text: string) => {
    const formattedDob = formatDob(text);
    setDob(formattedDob);
  };

  // Initialize form data from user prop
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setGender(user.gender?.toLowerCase() || '');
      if (user.dob) setDob(parseDobToDisplayFormat(user.dob)); // Convert YYYY-MM-DD to DD-MM-YYYY

      // Parse address
      if (user.address) {
        const addressParts = user.address.split(', ');
        if (addressParts.length === 5) {
          setStreet(addressParts[0]); // e.g., "97/2"
          setWard(addressParts[1]); // e.g., "An Thạnh"
          setDistrict(addressParts[2]); // e.g., "Bến Lức"
          setProvince(addressParts[3]); // e.g., "Long An"
        }
      }
    }
  }, [user]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await profileApi.getProvinceApi();
        const provinces = response.data.map((p: any) => ({
          label: p.name,
          value: p.id,
        }));
        setProvinceOptions(provinces);

        // Set initial province value after fetching options
        if (user.address) {
          const provinceName = user.address.split(', ')[3]; // e.g., "Long An"
          const matchedProvince = provinces.find((p: any) => p.label === provinceName);
          if (matchedProvince) setProvince(matchedProvince.value);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        Alert.alert(
          t('profile.error', { defaultValue: 'Error' }),
          t('profile.loadProvincesFailed', { defaultValue: 'Failed to load provinces' })
        );
      }
    };
    fetchProvinces();
  }, [user]);

  // Fetch districts when province changes or on init
  useEffect(() => {
    if (!province) {
      setDistrictOptions([]);
      setWardOptions([]);
      setDistrict('');
      setWard('');
      return;
    }

    const fetchDistricts = async () => {
      try {
        const response = await profileApi.getDistrictApi(province);
        const districts = response.data.map((d: any) => ({
          label: d.name,
          value: d.id,
        }));
        setDistrictOptions(districts);

        // Set initial district value after fetching options
        if (user.address && province) {
          const districtName = user.address.split(', ')[2]; // e.g., "Bến Lức"
          const matchedDistrict = districts.find((d: any) => d.label === districtName);
          if (matchedDistrict) setDistrict(matchedDistrict.value);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert(
          t('profile.error', { defaultValue: 'Error' }),
          t('profile.loadDistrictsFailed', { defaultValue: 'Failed to load districts' })
        );
      }
    };
    fetchDistricts();
  }, [province, user]);

  // Fetch wards when district changes or on init
  useEffect(() => {
    if (!district) {
      setWardOptions([]);
      setWard('');
      return;
    }

    const fetchWards = async () => {
      try {
        const response = await profileApi.getWardApi(district);
        const wards = response.data.map((w: any) => ({
          label: w.name,
          value: w.id,
        }));
        setWardOptions(wards);

        // Set initial ward value after fetching options
        if (user.address && district) {
          const wardName = user.address.split(', ')[1]; // e.g., "An Thạnh"
          const matchedWard = wards.find((w: any) => w.label === wardName);
          if (matchedWard) setWard(matchedWard.value);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
        Alert.alert(
          t('profile.error', { defaultValue: 'Error' }),
          t('profile.loadWardsFailed', { defaultValue: 'Failed to load wards' })
        );
      }
    };
    fetchWards();
  }, [district, user]);

  const mutation = useMutation(
    async (formData: FormDataType) => {
      const response = await apiClient.put('/users/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        const currentTime = new Date().toLocaleTimeString();
        Alert.alert(
          t('profile.success', { defaultValue: 'Success' }),
          `${t('profile.updateSuccess', {
            defaultValue: 'Profile updated successfully',
          })} at ${currentTime}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  (navigation.navigate as any)('ProfileManagementScreen');
                }, 1000);
              },
            },
          ]
        );
      },
      onError: (error: any) =>
        Alert.alert(
          t('profile.error', { defaultValue: 'Error' }),
          error.response?.data?.message ||
            t('profile.updateFailed', { defaultValue: 'Failed to update profile' })
        ),
    }
  );

  const handleUpdateProfile = async (): Promise<void> => {
    if (!name || !phoneNumber || !street || !ward || !district || !province || !dob || !gender) {
      Alert.alert(
        t('profile.error', { defaultValue: 'Error' }),
        t('profile.fillAllFields', { defaultValue: 'Please fill all fields' })
      );
      return;
    }

    const provinceName = provinceOptions.find((p) => p.value === province)?.label || '';
    const districtName = districtOptions.find((d) => d.value === district)?.label || '';
    const wardName = wardOptions.find((w) => w.value === ward)?.label || '';
    const fullAddress = `${street}, ${wardName}, ${districtName}, ${provinceName}, Vietnam`;

    const apiFormattedDob = parseDobToApiFormat(dob);

    const formData: FormDataType = {
      name,
      phoneNumber,
      address: fullAddress,
      dob: apiFormattedDob,
      gender,
    };

    mutation.mutate(formData);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TitleNameCows
        title={t('profile.updateTitle', { defaultValue: 'Update Your Profile' })}
        cowName=''
      />
      <Card style={styles.card}>
        <Card.Content>
          {/* Personal Info */}
          <Text style={styles.sectionTitle}>
            {t('profile.personalInfo', { defaultValue: 'Personal Information' })}
          </Text>
          <TextInput
            label={t('profile.fullName', { defaultValue: 'Full Name' })}
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode='outlined'
            disabled={!isEditing}
          />
          <TextInput
            label={t('profile.phoneNumber', { defaultValue: 'Phone Number' })}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType='phone-pad'
            style={styles.input}
            mode='outlined'
            disabled={!isEditing}
          />
          <TextInput
            label={t('profile.dob', { defaultValue: 'Date of Birth' })}
            value={dob}
            onChangeText={handleDobChange}
            placeholder={t('profile.dobPlaceholder', { defaultValue: 'DD-MM-YYYY' })}
            style={styles.input}
            mode='outlined'
            keyboardType='numeric'
            maxLength={10}
            disabled={!isEditing}
          />
          <CustomPicker
            options={genderOptions}
            selectedValue={gender}
            onValueChange={setGender}
            title={t('profile.selectGender', { defaultValue: 'Select Gender' })}
          />

          {/* Address */}
          <Text style={styles.sectionTitle}>
            {t('profile.address', { defaultValue: 'Address' })}
          </Text>
          <View style={styles.addressContainer}>
            <CustomPicker
              options={provinceOptions}
              selectedValue={province}
              onValueChange={setProvince}
              title={t('profile.selectProvince', { defaultValue: 'Select Province' })}
            />
            <CustomPicker
              options={districtOptions}
              selectedValue={district}
              onValueChange={setDistrict}
              title={t('profile.selectDistrict', { defaultValue: 'Select District' })}
              readOnly={!province}
            />
            <CustomPicker
              options={wardOptions}
              selectedValue={ward}
              onValueChange={setWard}
              title={t('profile.selectWard', { defaultValue: 'Select Ward' })}
              readOnly={!district}
            />
            <TextInput
              label={t('profile.streetAddress', { defaultValue: 'Street Address' })}
              value={street}
              onChangeText={setStreet}
              style={styles.input}
              mode='outlined'
              disabled={!isEditing}
            />
          </View>

          {/* Edit/Update Buttons */}
          {!isEditing ? (
            <Button mode='contained' onPress={() => setIsEditing(true)} style={styles.button}>
              {t('profile.editButton', { defaultValue: 'Edit Profile' })}
            </Button>
          ) : (
            <Button
              mode='contained'
              onPress={handleUpdateProfile}
              style={styles.button}
              loading={mutation.isLoading}
              disabled={mutation.isLoading}
            >
              {t('profile.updateButton', { defaultValue: 'Update Profile' })}
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginTop: 20,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
  addressContainer: {
    gap: 15,
  },
});

export default ProfileUpdateScreen;
