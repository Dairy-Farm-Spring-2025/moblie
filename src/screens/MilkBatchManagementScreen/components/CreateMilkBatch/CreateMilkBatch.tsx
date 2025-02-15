import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Text, TextInput, Card, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { useMutation, useQuery } from 'react-query';
import CardDetailCow from './components/CardDetailCow/CardDetailCow';

type CreateMilkBatchScreenProps = {
  params: {
    cowId: number;
  };
};

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};

const CreateMilkBatch = () => {
  const [volume, setVolume] = useState('');
  const [shift, setShift] = useState('morning');
  const [cowId, setCowId] = useState<number | null>(null);
  const route = useRoute<RouteProp<CreateMilkBatchScreenProps>>();
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.cowId) {
      setCowId(route.params.cowId);
    }
  }, [route.params?.cowId]);

  const {
    data: cow,
    isLoading,
    isError,
  } = useQuery(['cow', cowId], () => fetchCowDetails(cowId!), {
    enabled: cowId !== null, // Only fetch if cowId is set
  });

  const mutation = useMutation(
    async (data: any) => await apiClient.post('/MilkBatch/create', data),
    {
      onSuccess: () => {
        Alert.alert('Success', 'Milk batch created successfully');
        navigation.goBack();
      },
      onError: () => {
        Alert.alert('Error', 'Failed to create milk batch');
      },
    }
  );

  const handleSubmit = () => {
    if (!volume || !shift || cowId === null) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const data = {
      dailyMilks: [{ volume: parseFloat(volume), cowId }],
      shift,
    };

    console.log(data);

    mutation.mutate(data);
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Error loading cow details.</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Cow Information Card */}
        <View style={styles.detailCow}>
          {cow && (
            <CardDetailCow
              cow={cow}
              width={200}
              onPress={() => (navigation.navigate as any)('CowDetails', { cowId })}
            />
          )}
        </View>

        {/* Milk Batch Form */}
        <Text style={styles.cardTitle}>Daily Milk Volume:</Text>
        <TextInput
          style={styles.input}
          value={volume}
          onChangeText={setVolume}
          keyboardType='numeric'
          placeholder='Enter volume'
        />

        <Text style={styles.cardTitle}>Shift:</Text>
        <Picker selectedValue={shift} onValueChange={setShift}>
          <Picker.Item label='Shift 1 (0h-6h)' value='shiftOne' />
          <Picker.Item label='Shift 2 (6h-12h)' value='shiftTwo' />
          <Picker.Item label='Shift 3 (12h-18h)' value='shiftThree' />
          <Picker.Item label='Shift 4 (18h-24h)' value='shiftFour' />
        </Picker>

        <Button
          mode='contained'
          onPress={handleSubmit}
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
        >
          Submit
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  detailCow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginBottom: 20,
  },
});

export default CreateMilkBatch;
