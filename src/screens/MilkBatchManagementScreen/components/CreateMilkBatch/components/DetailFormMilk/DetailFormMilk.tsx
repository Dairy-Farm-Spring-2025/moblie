import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { Ionicons } from '@expo/vector-icons';
import { useListCowMilkStore } from '@core/store/ListCowDailyMilk/useListCowMilkStore';
import { formatCamelCase } from '@utils/format';

type RootStackParamList = {
  DetailFormMilk: { cowId: number; volume: number };
};

type DetailFormMilkRouteProp = RouteProp<RootStackParamList, 'DetailFormMilk'>;

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};

const DetailFormMilk: React.FC = () => {
  const route = useRoute<DetailFormMilkRouteProp>();
  const navigation = useNavigation();
  const { cowId, volume } = route.params;
  const [milkVolume, setMilkVolume] = useState('');
  const { listCowMilk, setListCowMilk } = useListCowMilkStore();

  const {
    data: cow,
    isLoading,
    isError,
  } = useQuery(['cow', cowId], () => fetchCowDetails(cowId), {});

  useEffect(() => {
    if (volume) {
      setMilkVolume(volume.toString());
    }
  }, [volume]);

  const handleSubmit = () => {
    if (!milkVolume.trim() || !cow) return;

    setListCowMilk({
      dailyMilk: { cowId, volume: parseFloat(milkVolume) },
      cow,
    });

    (navigation.navigate as any)('CreateMilkBatch');
  };

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading cow details...</Text>;
  }

  if (isError || !cow) {
    return <Text style={styles.errorText}>Failed to load cow details</Text>;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Image source={{ uri: 'https://picsum.photos/400/400' }} style={styles.image} />
        <View style={styles.card}>
          <Text style={styles.title}>{cow.name}</Text>
          <Text style={styles.text}>
            🐄 <Text style={styles.bold}>Status:</Text> {formatCamelCase(cow.cowStatus)}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Date of Birth:</Text> {cow.dateOfBirth}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Date Entered:</Text> {cow.dateOfEnter}
          </Text>
          {cow.dateOfOut && (
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>Date Out:</Text> {cow.dateOfOut}
            </Text>
          )}
          <Text style={styles.text}>
            📍 <Text style={styles.bold}>Origin:</Text> {formatCamelCase(cow.cowOrigin)}
          </Text>
          <Text style={styles.text}>
            ⚧ <Text style={styles.bold}>Gender:</Text> {formatCamelCase(cow.gender)}
          </Text>
          <Text style={styles.text}>
            🏡 <Text style={styles.bold}>In Pen:</Text> {cow.inPen ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.text}>
            🛠 <Text style={styles.bold}>Type:</Text> {cow.cowType.name}
          </Text>
          <Text style={styles.text}>
            📖 <Text style={styles.bold}>Description:</Text> {cow.description}
          </Text>
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.bottomContainer}
      >
        <TextInput
          style={styles.input}
          placeholder='Enter milk volume (L)'
          keyboardType='numeric'
          value={milkVolume}
          onChangeText={setMilkVolume}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name='send' size={24} color='white' />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  text: { fontSize: 16, color: '#555', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#222' },
  loadingText: { textAlign: 'center', fontSize: 18, marginTop: 50 },
  errorText: { textAlign: 'center', fontSize: 18, color: 'red', marginTop: 50 },

  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
  },
});

export default DetailFormMilk;
