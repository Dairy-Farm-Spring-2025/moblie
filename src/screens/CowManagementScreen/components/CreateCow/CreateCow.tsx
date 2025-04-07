import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useMutation } from 'react-query';
import { CreateCowModel } from '@model/Request/CreateCow';
import { CowType } from '@model/Cow/Cow';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const fetchCowType = async (): Promise<CowType[]> => {
  try {
    const response = await apiClient.get('/cow-types');
    return response.data;
  } catch (error) {
    throw new Error('Failed to load cow types');
  }
};

const CreateCow: React.FC = () => {
  const navigation = useNavigation();
  const { data: cowTypes, isLoading, isError } = useQuery('cow-types', fetchCowType);
  const { t } = useTranslation()
  const [cowData, setCowData] = useState<CreateCowModel>({
    cowStatus: 'milkingCow',
    dateOfBirth: new Date().toISOString(),
    dateOfEnter: new Date().toISOString(),
    cowOrigin: 'european',
    gender: 'female',
    cowTypeId: 0,
    description: '',
  });

  const mutation = useMutation(async () => await apiClient.post('/cows/create', cowData), {
    onSuccess: () => {
      Alert.alert('Success', 'Cow created successfully');
      navigation.goBack();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create cow');
    },
  });

  const handleChange = (key: keyof CreateCowModel, value: any) => {
    setCowData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{('Create New Cow')}</Text>

        <Text style={styles.label}>{('Description')}</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter description'
          value={cowData.description}
          onChangeText={(text) => handleChange('description', text)}
        />

        <Text style={styles.label}>{t('Cow Type')}</Text>
        {isLoading ? (
          <ActivityIndicator size='small' color='#0000ff' />
        ) : isError ? (
          <Text>Error loading cow types</Text>
        ) : (
          <Picker
            selectedValue={cowData.cowTypeId.toString()} // Ensure it's a string
            style={styles.input}
            onValueChange={(itemValue) => handleChange('cowTypeId', parseInt(itemValue, 10))} // Convert back to integer if necessary
          >
            {cowTypes?.map((type) => (
              <Picker.Item
                key={type.cowTypeId}
                label={type.name}
                value={type.cowTypeId.toString()} // Convert to string
              />
            ))}
          </Picker>
        )}

        <Text style={styles.label}>{t('Cow Status')}</Text>
        <Picker
          selectedValue={cowData.cowStatus}
          style={styles.input}
          onValueChange={(itemValue) => handleChange('cowStatus', itemValue)}
        >
          {[
            'milkingCow',
            'dryCow',
            'pregnantCow',
            'openCow',
            'calvingCow',
            'sickCow',
            'breedingCow',
            'quarantinedCow',
          ].map((status) => (
            <Picker.Item key={status} label={status.replace(/([A-Z])/g, ' $1')} value={status} />
          ))}
        </Picker>

        <Text style={styles.label}>Cow Origin</Text>
        <Picker
          selectedValue={cowData.cowOrigin}
          style={styles.input}
          onValueChange={(itemValue) => handleChange('cowOrigin', itemValue)}
        >
          {[
            'european',
            'indian',
            'african',
            'american',
            'australian',
            'exotic',
            'indigenous',
            'crossbreed',
          ].map((origin) => (
            <Picker.Item
              key={origin}
              label={origin.charAt(0).toUpperCase() + origin.slice(1)}
              value={origin}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={cowData.gender}
          style={styles.input}
          onValueChange={(itemValue) => handleChange('gender', itemValue)}
        >
          <Picker.Item label={t('Female')} value='female' />
          <Picker.Item label={t('Male')} value='male' />
        </Picker>

        <Text style={styles.label}>{t('Date of Birth')}</Text>
        <DateTimePicker
          value={new Date(cowData.dateOfBirth)}
          mode='date'
          display='default'
          onChange={(event, selectedDate) =>
            handleChange('dateOfBirth', selectedDate?.toISOString() || cowData.dateOfBirth)
          }
        />

        <Text style={styles.label}>{t('Date of Enter')}</Text>
        <DateTimePicker
          value={new Date(cowData.dateOfEnter)}
          mode='date'
          display='default'
          onChange={(event, selectedDate) =>
            handleChange('dateOfEnter', selectedDate?.toISOString() || cowData.dateOfEnter)
          }
        />

        <Button
          style={{ marginVertical: 10 }}
          mode='contained'
          onPress={() => mutation.mutate()}
          disabled={mutation.isLoading}
        >
          Create
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  label: { fontSize: 16, marginTop: 10, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginTop: 5,
  },
});

export default CreateCow;
