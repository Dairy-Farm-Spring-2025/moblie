import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useQuery } from 'react-query';
import CardCowDetail from './components/CardCowDetail';
import CardFormHealthRecord from './components/CardFormHealthRecord';

type RootStackParamList = {
  CowHealthRecord: { cowId: number };
};

type CowHealthRecordRouteProp = RouteProp<
  RootStackParamList,
  'CowHealthRecord'
>;

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};
const CowHealthRecord = () => {
  const route = useRoute<CowHealthRecordRouteProp>();
  const navigation = useNavigation();
  const { cowId } = route.params;
  const {
    data: cow,
    isLoading,
    isError,
    error,
  } = useQuery(['cow', cowId], () => fetchCowDetails(cowId));

  if (isLoading) return <ActivityIndicator />;

  if (isError) {
    Alert.alert(error as any);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <CardCowDetail cow={cow as Cow} />
            <CardFormHealthRecord cowId={cowId} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    gap: 20,
  },
  formContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  inputContainer: {},
  label: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  error: {
    color: 'red',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default CowHealthRecord;
