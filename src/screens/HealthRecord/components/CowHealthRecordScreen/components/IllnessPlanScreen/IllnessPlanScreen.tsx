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
  FlatList,
  Keyboard,
} from 'react-native';
import { useQuery } from 'react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { t } from 'i18next';
import apiClient from '@config/axios/axios';
import { InjectionSite } from '@model/Illness/enums/InjectionSite';
import { Item } from '@model/Item/Item';
import { IllnessPlan, IllnessPlanRequest } from '@model/IllnessPlan/IllnessPlan';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import { IllnessCow } from '@model/Cow/Cow';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import { formatCamelCase, getVietnamISOString } from '@utils/format';

type RootStackParamList = {
  IllnessPlanScreen: { illness: IllnessCow };
};

type IllnessPlanScreenRouteProp = RouteProp<RootStackParamList, 'IllnessPlanScreen'>;

// Extend IllnessPlan to allow dosage as string for input handling
interface ExtendedIllnessPlan extends Omit<IllnessPlan, 'dosage'> {
  dosage: string; // Store as string for input handling
}

// Fetch vaccine data
const fetchVaccines = async (): Promise<Item[]> => {
  const response = await apiClient.get('/items/vaccine');
  return response.data;
};

const IllnessPlanScreen = () => {
  const route = useRoute<IllnessPlanScreenRouteProp>();
  const navigation = useNavigation();
  const { illness } = route.params;

  const [plans, setPlans] = useState<ExtendedIllnessPlan[]>([
    {
      dosage: '',
      injectionSite: '' as InjectionSite,
      date: new Date(getVietnamISOString().split('T')[0]), // Store as Date object
      itemId: 0,
      description: '',
      illnessId: illness.illnessId,
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<boolean[]>([true]);
  const [errors, setErrors] = useState<{ [key: string]: { message: string } }[]>([{}]);

  // Fetch vaccines
  const {
    data: vaccines,
    isLoading,
    isError,
  } = useQuery('vaccines', fetchVaccines, {
    onError: (error) => {
      console.error('Error fetching vaccines:', error);
    },
  });

  // Map vaccines to CustomPicker options
  const vaccineOptions: Option[] = vaccines
    ? vaccines.map((vaccine) => ({
        label: vaccine.name,
        value: vaccine.itemId.toString(),
      }))
    : [];

  // Options for InjectionSite picker
  const injectionSiteOptions: Option[] = Object.values(InjectionSite).map((site) => ({
    label: formatCamelCase(t(`data.injectionSite.${site}`)),
    value: site,
  }));

  const handlePlanChange = (index: number, field: keyof ExtendedIllnessPlan, value: any) => {
    setPlans((prev) => prev.map((plan, i) => (i === index ? { ...plan, [field]: value } : plan)));
  };

  const addNewPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        dosage: '',
        injectionSite: '' as InjectionSite,
        date: new Date(getVietnamISOString().split('T')[0]), // Default to today
        itemId: 0,
        description: '',
        illnessId: illness.illnessId,
      },
    ]);
    setExpandedPlans((prev) => [...prev, true]);
    setErrors((prev) => [...prev, {}]);
  };

  const removePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
    setExpandedPlans((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePlan = (index: number) => {
    setExpandedPlans((prev) => prev.map((expanded, i) => (i === index ? !expanded : expanded)));
  };

  const handleDateChange = (index: number, event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      handlePlanChange(index, 'date', selectedDate); // Store as Date object
    }
  };

  const formatDateDisplay = (date: Date | string) => {
    if (!date) return t('illness_plan.select_date', { defaultValue: 'Select date...' });
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime()))
      return t('illness_plan.select_date', { defaultValue: 'Select date...' });
    return dateObj.toLocaleDateString('vi-VN'); // Format as DD/MM/YYYY in Vietnamese locale
  };

  const handleSubmit = async () => {
    // Validation for each plan
    const newErrors = plans.map((plan) => {
      const error: { [key: string]: { message: string } } = {};
      const dosageStr = plan.dosage.replace(',', '.'); // Normalize to period
      const dosageNum = parseFloat(dosageStr);

      // Validate itemId (Vaccine/Medication)
      if (plan.itemId === 0) {
        error.itemId = {
          message: t('illness_plan.vaccine_error', { defaultValue: 'Please select a vaccine' }),
        };
      }

      // Validate injectionSite
      if (!plan.injectionSite || !Object.values(InjectionSite).includes(plan.injectionSite)) {
        error.injectionSite = {
          message: t('illness_plan.injection_site_error', {
            defaultValue: 'Please select an injection site',
          }),
        };
      }

      // Validate dosage
      if (!dosageStr) {
        error.dosage = {
          message: t('illness_plan.dosage_required', {
            defaultValue: 'Dosage is required',
          }),
        };
      } else if (dosageNum <= 0 || isNaN(dosageNum)) {
        error.dosage = {
          message: t('illness_plan.dosage_error', {
            defaultValue: 'Dosage must be a valid number greater than 0',
          }),
        };
      } else if (!/^[0-9]+([.][0-9]{1,4})?$/.test(dosageStr)) {
        error.dosage = {
          message: t('illness_plan.dosage_format_error', {
            defaultValue: 'Dosage must be a valid decimal number (e.g., 1.23)',
          }),
        };
      }

      // Validate date
      const dateObj = plan.date instanceof Date ? plan.date : new Date(plan.date);
      if (!plan.date || isNaN(dateObj.getTime())) {
        error.date = {
          message: t('illness_plan.date_error', {
            defaultValue: 'Please select a valid date',
          }),
        };
      }

      // Validate description
      if (!plan.description.trim()) {
        error.description = {
          message: t('illness_plan.description_error', {
            defaultValue: 'Description is required',
          }),
        };
      }

      return error;
    });

    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.some((error) => Object.keys(error).length > 0)) {
      return;
    }

    // Convert dosage to number and date to ISO string for submission
    const formattedPlans: IllnessPlan[] = plans.map((plan) => {
      const dateObj = plan.date instanceof Date ? plan.date : new Date(plan.date);
      return {
        ...plan,
        dosage: parseFloat(plan.dosage.replace(',', '.')),
        date: dateObj.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      };
    });

    const requestBody: IllnessPlanRequest = { plans: formattedPlans };
    try {
      await apiClient.post('/illness-detail/create-plan', requestBody.plans);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting illness plans:', error);
      alert(
        t('illness_plan.submit_error', {
          defaultValue: 'Error submitting plans. Please try again.',
        })
      );
    }
  };

  const isExpendedIcons = (index: number) => {
    return expandedPlans[index] ? 'up' : 'down';
  };

  const renderPlan = ({ item, index }: { item: ExtendedIllnessPlan; index: number }) => (
    <View style={styles.planCard}>
      <TouchableOpacity style={styles.planHeader} onPress={() => togglePlan(index)}>
        <Text style={styles.planTitle}>
          {t('illness_plan.plan', { defaultValue: 'Plan' })} {index + 1}
        </Text>
        <AntDesign name={isExpendedIcons(index)} size={24} color='#333' />
      </TouchableOpacity>

      {expandedPlans[index] && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('illness_plan.vaccine', { defaultValue: 'Vaccine/Medication' })} *
            </Text>
            {isLoading ? (
              <Text style={styles.loadingText}>
                {t('illness_plan.loading', { defaultValue: 'Loading vaccines...' })}
              </Text>
            ) : isError ? (
              <Text style={styles.errorText}>
                {t('illness_plan.error', { defaultValue: 'Error loading vaccines' })}
              </Text>
            ) : (
              <>
                <CustomPicker
                  options={vaccineOptions}
                  selectedValue={item.itemId.toString()}
                  onValueChange={(value) => handlePlanChange(index, 'itemId', Number(value))}
                  title={t('illness_plan.select_vaccine', { defaultValue: 'Select vaccine...' })}
                />
                {errors[index]?.itemId && (
                  <Text style={styles.errorText}>{errors[index].itemId.message}</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('illness_plan.injection_site', { defaultValue: 'Injection Site' })} *
            </Text>
            <CustomPicker
              options={injectionSiteOptions}
              selectedValue={item.injectionSite}
              onValueChange={(value) =>
                handlePlanChange(index, 'injectionSite', value as InjectionSite)
              }
              title={t('illness_plan.select_injection_site', {
                defaultValue: 'Select injection site...',
              })}
            />
            {errors[index]?.injectionSite && (
              <Text style={styles.errorText}>{errors[index].injectionSite.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('illness_plan.dosage', { defaultValue: 'Dosage (mL or mg)' })} *
            </Text>
            <TextInput
              style={[styles.input, errors[index]?.dosage && styles.inputError]}
              value={item.dosage}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9.,]/g, '');
                handlePlanChange(index, 'dosage', numericValue);
              }}
              placeholder={t('illness_plan.dosage_placeholder', { defaultValue: 'Enter dosage' })}
              keyboardType='decimal-pad'
              maxLength={6} // Allows for up to 4 decimal places (e.g., 12.34)
              returnKeyType='done'
              onSubmitEditing={Keyboard.dismiss}
            />
            {errors[index]?.dosage && (
              <Text style={styles.errorText}>{errors[index].dosage.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('illness_plan.date', { defaultValue: 'Date' })} *</Text>
            <TouchableOpacity
              style={[styles.input, errors[index]?.date && styles.inputError]}
              onPress={() => setShowDatePicker(index)}
              activeOpacity={0.7} // Provide feedback on press
            >
              <Text style={styles.dateText}>{formatDateDisplay(item.date)}</Text>
            </TouchableOpacity>
            {showDatePicker === index && (
              <DateTimePicker
                value={item.date instanceof Date ? item.date : new Date()}
                mode='date'
                display={Platform.OS === 'ios' ? 'inline' : 'default'} // Use inline for iOS to avoid double tap
                minimumDate={new Date()}
                onChange={(event, date) => handleDateChange(index, event, date)}
              />
            )}
            {errors[index]?.date && (
              <Text style={styles.errorText}>{errors[index].date.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('illness_plan.description', { defaultValue: 'Description' })} *
            </Text>
            <TextEditorComponent
              onChange={(text: string) => handlePlanChange(index, 'description', text)}
              value={item.description}
              error={errors[index]?.description?.message}
            />
          </View>

          {plans.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removePlan(index)}>
              <Text style={styles.removeButtonText}>
                {t('illness_plan.remove', { defaultValue: 'Remove Plan' })}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TitleNameCows
        title={`${t('illness_plan.treatment_plan', { defaultValue: 'Treatment Plan' })} - `}
        cowName={illness.cowEntity.name}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FlatList
          data={plans}
          renderItem={renderPlan}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />

        <TouchableOpacity style={styles.addButton} onPress={addNewPlan}>
          <Text style={styles.addButtonText}>
            {t('illness_plan.add_plan', { defaultValue: 'Add Another Plan' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {t('illness_plan.submit', { defaultValue: 'Submit Plans' })}
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
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    justifyContent: 'center', // Ensure text is centered vertically
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 5,
  },
});

export default IllnessPlanScreen;
