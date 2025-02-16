import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Card, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { useMutation, useQuery } from 'react-query';
import CardDetailCow from './components/CardDetailCow/CardDetailCow';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import { useListCowMilkStore } from '@core/store/ListCowDailyMilk/useListCowMilkStore';

const CreateMilkBatch = () => {
  const [volume, setVolume] = useState('');
  const [shift, setShift] = useState('morning');
  const { listCowMilk, setListCowMilk } = useListCowMilkStore();

  const navigation = useNavigation();

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
    if (!shift || listCowMilk === null) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const dailyMilkList = listCowMilk.map((c) => c.dailyMilk);

    const data = {
      dailyMilks: dailyMilkList,
      shift,
    };

    console.log(data);

    mutation.mutate(data);
  };

  return (
    <ScrollView>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          {/* Cow Information Card */}
          <View style={styles.detailCow}>
            {listCowMilk.map((c, index) => (
              <CardDetailCow
                key={index}
                dailyMilk={{ volume: c.dailyMilk?.volume || 0, cowId: c.cow?.cowId || 0 }}
                cow={c.cow}
                width={200}
                onPress={() =>
                  (navigation.navigate as any)('DetailFormMilk', {
                    cowId: c.cow?.cowId,
                    volume: c.dailyMilk?.volume || 0,
                    screens: 'CreateMilkBatch',
                  })
                }
              />
            ))}
          </View>

          {/* Milk Batch Form */}
          <View style={styles.formContainer}>
            <Text style={styles.cardTitle}>Shift:</Text>
            <Picker selectedValue={shift} onValueChange={setShift}>
              <Picker.Item label='Shift 1 (0h-6h)' value='shiftOne' />
              <Picker.Item label='Shift 2 (6h-12h)' value='shiftTwo' />
              <Picker.Item label='Shift 3 (12h-18h)' value='shiftThree' />
              <Picker.Item label='Shift 4 (18h-24h)' value='shiftFour' />
            </Picker>
          </View>

          <FloatingButton
            onPress={() =>
              (navigation.navigate as any)('QrCodeScanCow', { screens: 'DetailFormMilk' })
            }
          />

          {/* Submit Button at Bottom */}
          <View style={styles.buttonContainer}>
            <Button
              mode='contained'
              onPress={handleSubmit}
              loading={mutation.isLoading}
              disabled={mutation.isLoading}
            >
              Submit
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', // Ensures spacing between content and button
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
  formContainer: {
    flexGrow: 1, // Pushes content up, leaving space for the button at the bottom
  },
  buttonContainer: {
    paddingBottom: 4, // Add some spacing for better appearance
  },
});

export default CreateMilkBatch;
