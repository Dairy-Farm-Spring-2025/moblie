import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { Ionicons } from '@expo/vector-icons';
import { useListCowMilkStore } from '@core/store/ListCowDailyMilk/useListCowMilkStore';
import { formatCamelCase } from '@utils/format';
import { t } from 'i18next';

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
  const { cowId, volume } = route.params;
  const [milkVolume, setMilkVolume] = useState('');
  const { setListCowMilk } = useListCowMilkStore();
  const navigation = useNavigation();

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

  useEffect(() => {
    if (cow && cow.cowStatus !== 'milkingCow') {
      Alert.alert(
        t('milkbatch.cowStatusAlert.title', { status: cow?.cowStatus }),
        t('milkbatch.cowStatusAlert.message'),
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1, // QrCodeScanCow is active
                  routes: [
                    { name: 'CreateMilkBatch' }, // Base screen
                    { name: 'QrCodeScanCow', params: { screens: 'DetailFormMilk' } }, // Active screen
                  ],
                })
              );
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [cow, navigation]);

  const handleSubmit = () => {
    if (!milkVolume.trim() || !cow) return;

    setListCowMilk({
      dailyMilk: { cowId, volume: parseFloat(milkVolume) },
      cow,
    });
    navigation.goBack(); // Return to CreateMilkBatch
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
        <View style={styles.card}>
          <Text style={styles.title}>{cow.name}</Text>
          <Text style={styles.text}>
            🐄 <Text style={styles.bold}>{t('Status')}:</Text> {t(formatCamelCase(cow.cowStatus))}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('Date of Birth')}:</Text> {cow.dateOfBirth}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('Date Entered')}:</Text> {cow.dateOfEnter}
          </Text>
          {cow.dateOfOut && (
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('Date Out')}:</Text> {cow.dateOfOut}
            </Text>
          )}
          <Text style={styles.text}>
            📍 <Text style={styles.bold}>{t('Origin')}:</Text> {t(formatCamelCase(cow.cowOrigin))}
          </Text>
          <Text style={styles.text}>
            ⚧ <Text style={styles.bold}>{t('Gender')}:</Text> {t(formatCamelCase(cow.gender))}
          </Text>
          <Text style={styles.text}>
            🏡 <Text style={styles.bold}>{t('In Pen')}:</Text> {cow.inPen ? t('Yes') : t('No')}
          </Text>
          <Text style={styles.text}>
            🛠 <Text style={styles.bold}>{t('Type')}:</Text> {cow.cowType.name}
          </Text>
          <Text style={styles.text}>
            📖 <Text style={styles.bold}>{t('Description')}:</Text> {cow.description}
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
          placeholder={t('Enter milk volume (L)')}
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
    bottom: 35,
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
