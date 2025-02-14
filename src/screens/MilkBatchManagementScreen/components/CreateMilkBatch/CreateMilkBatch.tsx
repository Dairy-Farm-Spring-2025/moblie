import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Button,
  Image,
} from 'react-native';
import { Text, TextInput, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow, CowStatus, CowOrigin, Gender } from '@model/Cow/Cow';
import { useQuery } from 'react-query';
import CardCow from '@components/CardCow/CardCow';

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
  const [shift, setShift] = useState('');
  const [cowId, setCowId] = useState<number | null>(null);
  const route = useRoute<RouteProp<CreateMilkBatchScreenProps>>();
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.cowId) {
      setCowId(route.params.cowId); // Get the cowId from the passed params
    }
  }, [route.params?.cowId]);

  const {
    data: cow,
    isLoading,
    isError,
  } = useQuery(['cow', cowId], () => fetchCowDetails(cowId || 0));

  const handleSubmit = () => {
    if (volume && shift && cowId !== null) {
      const data = {
        dailyMilks: [
          {
            volume: parseFloat(volume),
            cowId: cowId,
          },
        ],
        shift: shift,
      };
      // Submit form data to your API or process it
      console.log('Form Data:', data);
    } else {
      console.log('Please fill in all fields.');
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Error loading cow details.</Text>;
  }

  const navigateToCowDetails = (cowId: number | null) => {
    (navigation.navigate as any)('CowDetails', { cowId });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Cow Information Card */}
        <CardCow cow={cow} onPress={() => navigateToCowDetails(cowId)} />

        {/* Milk Batch Form */}
        <Text>Daily Milk Volume:</Text>
        <TextInput
          value={volume}
          onChangeText={setVolume}
          keyboardType='numeric'
          placeholder='Enter volume'
        />

        <Text>Shift:</Text>
        <Picker selectedValue={shift} onValueChange={setShift}>
          <Picker.Item label='Morning' value='morning' />
          <Picker.Item label='Afternoon' value='afternoon' />
          <Picker.Item label='Night' value='night' />
        </Picker>

        <Button title='Submit' onPress={handleSubmit} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CreateMilkBatch;
