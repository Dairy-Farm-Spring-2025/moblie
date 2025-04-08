import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { t } from 'i18next';
import { useMutation, useQuery } from 'react-query';
import apiClient from '@config/axios/axios'; // Adjust the import path as needed
import CardCow from '@components/CardCow/CardCow';
import { Cow } from '@model/Cow/Cow';
import { IllnessSeverity } from '@model/Illness/enums/IllnessSeverity';
import { InjectionSite } from '@model/Illness/enums/InjectionSite';
import { IllnessReportRequest, TreatmentDetail } from '@model/Illness/Request/IllnessCreate';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';

// TypeScript interfaces for the API response
interface CategoryEntity {
  categoryId: number;
  name: string;
}

interface WarehouseLocationEntity {
  warehouseLocationId: number;
  name: string;
  description: string;
  type: string;
}

interface Item {
  itemId: number;
  name: string;
  description: string;
  status: string;
  unit: string;
  categoryEntity: CategoryEntity;
  warehouseLocationEntity: WarehouseLocationEntity;
}

type RootStackParamList = {
  IllnessReportScreen: { cow: Cow };
};

type IllnessReportScreenRouteProp = RouteProp<RootStackParamList, 'IllnessReportScreen'>;

// Fetch vaccine data
const fetchVaccines = async (): Promise<Item[]> => {
  const response = await apiClient.get('/items/vaccine');
  return response.data;
};

const IllnessReportScreen = () => {
  const route = useRoute<IllnessReportScreenRouteProp>();
  const navigation = useNavigation();
  const cow = route.params.cow;

  const [formData, setFormData] = useState<IllnessReportRequest>({
    symptoms: '',
    severity: IllnessSeverity.none,
    prognosis: '',
    cowId: cow.cowId,
    detail: [
      {
        dosage: 0,
        injectionSite: InjectionSite.leftArm,
        date: '2025-04-08', // Hardcoded for demo
        description: '',
        vaccineId: 0,
      },
    ],
  });

  const { mutate } = useMutation(
    async (data: IllnessReportRequest) => await apiClient.post(`illness/create`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message);
        (navigation as any).navigate('Home');
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  // Fetch vaccines using react-query
  const {
    data: vaccines,
    isLoading,
    isError,
  } = useQuery('vaccines', fetchVaccines, {
    onError: (error) => {
      console.error('Error fetching vaccines:', error);
      // Optionally show an alert to the user
    },
  });

  // Map vaccines to CustomPicker options
  const vaccineOptions: Option[] = vaccines
    ? vaccines.map((vaccine) => ({
        label: vaccine.name,
        value: vaccine.itemId.toString(), // Use itemId as the value (vaccineId)
      }))
    : [];

  // Options for IllnessSeverity picker
  const severityOptions: Option[] = Object.values(IllnessSeverity).map((severity) => ({
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: severity,
  }));

  // Options for InjectionSite picker
  const injectionSiteOptions: Option[] = Object.values(InjectionSite).map((site) => ({
    label: site
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: site,
  }));

  const handleInputChange = (field: keyof IllnessReportRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (field: keyof TreatmentDetail, value: any) => {
    setFormData((prev) => ({
      ...prev,
      detail: [{ ...prev.detail[0], [field]: value }],
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting Illness Report:', formData);
    mutate(formData);
    // Add your API call here to submit the form data
    // Example:
    // await apiClient.post('/illness-report', formData);
    // navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          {t('illness_report.title', { defaultValue: 'Illness Report' })}
        </Text>

        <CardCow cow={cow} onPress={() => console.log('Cow card pressed')} />

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.symptoms', { defaultValue: 'Symptoms' })}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.symptoms}
            onChangeText={(text) => handleInputChange('symptoms', text)}
            placeholder={t('illness_report.symptoms_placeholder', {
              defaultValue: 'Enter symptoms (e.g., Fever, lethargy)',
            })}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.severity', { defaultValue: 'Severity' })}
          </Text>
          <CustomPicker
            options={severityOptions}
            selectedValue={formData.severity}
            onValueChange={(value) => handleInputChange('severity', value as IllnessSeverity)}
            title={t('illness_report.select_severity', { defaultValue: 'Select severity...' })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.prognosis', { defaultValue: 'Prognosis' })}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.prognosis}
            onChangeText={(text) => handleInputChange('prognosis', text)}
            placeholder={t('illness_report.prognosis_placeholder', {
              defaultValue: 'Enter prognosis (e.g., Expected recovery in 7-10 days)',
            })}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.dosage', { defaultValue: 'Dosage (mL or mg)' })}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.detail[0].dosage.toString()}
            onChangeText={(text) => handleDetailChange('dosage', Number(text))}
            placeholder={t('illness_report.dosage_placeholder', { defaultValue: 'Enter dosage' })}
            keyboardType='numeric'
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.injection_site', { defaultValue: 'Injection Site' })}
          </Text>
          <CustomPicker
            options={injectionSiteOptions}
            selectedValue={formData.detail[0].injectionSite}
            onValueChange={(value) => handleDetailChange('injectionSite', value as InjectionSite)}
            title={t('illness_report.select_injection_site', {
              defaultValue: 'Select injection site...',
            })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.treatment_date', { defaultValue: 'Treatment Date' })}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.detail[0].date}
            onChangeText={(text) => handleDetailChange('date', text)}
            placeholder={t('illness_report.date_placeholder', {
              defaultValue: 'Enter date (YYYY-MM-DD)',
            })}
            editable={false} // Hardcoded for demo; consider using a date picker
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.vaccine', { defaultValue: 'Vaccine/Medication' })}
          </Text>
          {isLoading ? (
            <Text style={styles.loadingText}>
              {t('illness_report.loading', { defaultValue: 'Loading vaccines...' })}
            </Text>
          ) : isError ? (
            <Text style={styles.errorText}>
              {t('illness_report.error', { defaultValue: 'Error loading vaccines' })}
            </Text>
          ) : (
            <CustomPicker
              options={vaccineOptions}
              selectedValue={formData.detail[0].vaccineId.toString()}
              onValueChange={(value) => handleDetailChange('vaccineId', Number(value))}
              title={t('illness_report.select_vaccine', { defaultValue: 'Select vaccine...' })}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('illness_report.treatment_description', { defaultValue: 'Treatment Description' })}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.detail[0].description}
            onChangeText={(text) => handleDetailChange('description', text)}
            placeholder={t('illness_report.description_placeholder', {
              defaultValue: 'Enter treatment description',
            })}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {t('illness_report.submit', { defaultValue: 'Submit Report' })}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    minHeight: 50,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default IllnessReportScreen;
