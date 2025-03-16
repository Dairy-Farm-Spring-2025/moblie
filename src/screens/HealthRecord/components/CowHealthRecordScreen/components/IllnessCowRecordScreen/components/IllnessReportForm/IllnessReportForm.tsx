// IllnessReportForm.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import { Cow } from '@model/Cow/Cow';

type RootStackParamList = {
  IllnessReportForm: { cow: Cow };
};

type IllnessReportFormRouteProp = RouteProp<RootStackParamList, 'IllnessReportForm'>;

const IllnessReportForm = () => {
  const route = useRoute<IllnessReportFormRouteProp>();
  const navigation = useNavigation();
  const { cow: Cow } = route.params;
  const [symptoms, setSymptoms] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async (data: { symptoms: string; cowId: number }) => {
      return await apiClient.post('/illness/report', data);
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!symptoms.trim()) {
      newErrors.symptoms = 'Symptoms are required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    mutation.mutate(
      { symptoms, cowId: Cow.cowId },
      {
        onSuccess: (data) => {
          console.log('Report submitted successfully:', data);
          setSuccessMessage('Report submitted successfully, redirecting...');
          setSymptoms('');
          Keyboard.dismiss();
          setTimeout(() => {
            setSuccessMessage('');
            navigation.goBack(); // Navigate back to the previous screen
          }, 1000); // Delay navigation by 1 second to show success message
        },
        onError: (error: any) => {
          console.error('Error submitting report:', error);
          setErrors({ serverError: error.message || 'Something went wrong' });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TitleNameCows title='Illness Record - ' cowName={Cow.name.toString()} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant='headlineMedium' style={styles.title}>
            Report Illness
          </Text>
          {successMessage && <Text style={styles.successText}> {successMessage} </Text>}
          {errors.serverError && <Text style={styles.errorText}> {errors.serverError} </Text>}
          <Text style={styles.inputLabel}>Symptoms</Text>
          <TextInput
            style={[styles.textInput, styles.multilineTextInput]}
            multiline
            placeholder='Describe the symptoms in detail...'
            value={symptoms}
            numberOfLines={5}
            textAlignVertical='top'
            onChangeText={setSymptoms}
          />
          {errors.symptoms && <Text style={styles.errorText}> {errors.symptoms} </Text>}
          <Button
            mode='contained'
            onPress={handleSubmit}
            disabled={mutation.isLoading}
            style={styles.submitButton}
          >
            Submit Report
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Loading Overlay */}
      {mutation.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size='large' color='#007AFF' />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom content
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputLabel: {
    marginVertical: 10,
    color: '#555',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    fontFamily: 'System',
    backgroundColor: '#fff',
  },
  multilineTextInput: {
    height: 150,
  },
  errorText: {
    color: 'red',
    marginVertical: 5,
  },
  successText: {
    color: 'green',
    marginVertical: 10,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Cover the entire screen
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent gray overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it stays on top
  },
});

export default IllnessReportForm;
