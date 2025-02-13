import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from 'react-query';
import { CreateCowModel } from '@model/Request/CreateCow';
import { CowType } from '@model/Cow/Cow';

// Update fetchCowType to extract the data from the API response
const fetchCowType = async (): Promise<CowType[]> => {
  const response = await apiClient.get('/cow-types');
  return response.data; // Assuming response.data contains the cow types
};

const CreateCow: React.FC = () => {
  const { data: cowTypes, isLoading, isError } = useQuery('cow-types', fetchCowType);
  const navigation = useNavigation();

  const [cowData, setCowData] = useState<CreateCowModel>({
    cowStatus: 'milkingCow',
    dateOfBirth: new Date().toISOString(),
    dateOfEnter: new Date().toISOString(),
    cowOrigin: 'european',
    gender: 'female',
    cowTypeId: 0,
    description: '',
  });

  const [openDateOfBirth, setOpenDateOfBirth] = useState(false);
  const [openDateOfEnter, setOpenDateOfEnter] = useState(false);

  const handleChange = (key: keyof CreateCowModel, value: any) => {
    setCowData({ ...cowData, [key]: value });
  };

  const handleCreateCow = async () => {
    if (!cowData.cowTypeId || !cowData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await apiClient.post('/cows/create', cowData);
      Alert.alert('Success', 'Cow created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create cow');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Cow</Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter description'
          value={cowData.description}
          onChangeText={(text) => handleChange('description', text)}
        />

        <Text style={styles.label}>Cow Type</Text>
        <View style={styles.option}>
          <Picker
            style={styles.input}
            selectedValue={cowData.cowTypeId ? cowData.cowTypeId.toString() : '0'}
            onValueChange={(itemValue) => handleChange('cowTypeId', parseInt(itemValue))}
          >
            {isLoading ? (
              <Picker.Item label='Loading...' value='0' />
            ) : isError ? (
              <Picker.Item label='Error loading cow types' value='0' />
            ) : (
              cowTypes?.map((type) => (
                <Picker.Item
                  key={type.cowTypeId}
                  label={type.name}
                  value={type.cowTypeId.toString()}
                />
              ))
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Cow Status</Text>
        <View style={styles.option}>
          <Picker
            selectedValue={cowData.cowStatus}
            style={styles.input}
            onValueChange={(itemValue) => handleChange('cowStatus', itemValue)}
          >
            <Picker.Item label='Milking Cow' value='milkingCow' />
            <Picker.Item label='Dry Cow' value='dryCow' />
            <Picker.Item label='Pregnant Cow' value='pregnantCow' />
            <Picker.Item label='Open Cow' value='openCow' />
            <Picker.Item label='Calving Cow' value='calvingCow' />
            <Picker.Item label='Sick Cow' value='sickCow' />
            <Picker.Item label='Breeding Cow' value='breedingCow' />
            <Picker.Item label='Quarantined Cow' value='quarantinedCow' />
          </Picker>
        </View>

        <Text style={styles.label}>Cow Origin</Text>
        <View style={styles.option}>
          <Picker
            selectedValue={cowData.cowOrigin}
            style={styles.input}
            onValueChange={(itemValue) => handleChange('cowOrigin', itemValue)}
          >
            <Picker.Item label='European' value='european' />
            <Picker.Item label='Indian' value='indian' />
            <Picker.Item label='African' value='african' />
            <Picker.Item label='American' value='american' />
            <Picker.Item label='Australian' value='australian' />
            <Picker.Item label='Exotic' value='exotic' />
            <Picker.Item label='Indigenous' value='indigenous' />
            <Picker.Item label='Crossbreed' value='crossbreed' />
          </Picker>
        </View>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.option}>
          <Picker
            selectedValue={cowData.gender}
            style={styles.input}
            onValueChange={(itemValue) => handleChange('gender', itemValue)}
          >
            <Picker.Item label='Female' value='female' />
            <Picker.Item label='Male' value='male' />
          </Picker>
        </View>

        <Text style={styles.label}>Date of Birth</Text>

        <DateTimePicker
          value={new Date(cowData.dateOfBirth)}
          mode='date'
          display='default'
          onChange={(event, selectedDate) => {
            setOpenDateOfBirth(false);
            handleChange('dateOfBirth', selectedDate?.toISOString() || cowData.dateOfBirth);
          }}
        />

        <Text style={styles.label}>Date of Enter</Text>

        <DateTimePicker
          value={new Date(cowData.dateOfEnter)}
          mode='date'
          display='default'
          onChange={(event, selectedDate) => {
            setOpenDateOfEnter(false);
            handleChange('dateOfEnter', selectedDate?.toISOString() || cowData.dateOfEnter);
          }}
        />

        <Button title='Create Cow' onPress={handleCreateCow} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 16, marginTop: 10 },
  option: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
});

export default CreateCow;
