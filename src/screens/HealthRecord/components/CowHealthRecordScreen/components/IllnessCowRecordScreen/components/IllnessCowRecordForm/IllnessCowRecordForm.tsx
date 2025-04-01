import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormItem from '@components/Form/FormItem';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import { IllnessCow } from '@model/Cow/Cow';
import { IllnessPayload } from '@model/HealthRecord/HealthRecord';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from 'react-native-paper';
import { convertToDDMMYYYY } from '@utils/format';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons

interface IllnessCowRecordFormProps {
  illness: IllnessCow;
}

const IllnessCowRecordForm = ({ illness }: IllnessCowRecordFormProps) => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
  const [startDate, setStartDate] = useState(
    new Date(illness.startDate)?.toISOString()
  );
  const [endDate, setEndDate] = useState(
    new Date(illness.endDate)?.toISOString()
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IllnessPayload>({
    defaultValues: {
      cowId: illness.cowEntity.cowId,
      prognosis: illness.prognosis,
      severity: illness.severity,
      symptoms: illness.symptoms,
    },
  });

  const { mutate } = useMutation(
    async (data: IllnessPayload) =>
      await apiClient.put(`illness/${illness.illnessId}`, data),
    {
      onSuccess: (response: any) => {
        console.log(response);
        Alert.alert('Success', response.message);
        setIsEditing(false); // Exit edit mode on success
        (navigation.navigate as any)('CowDetails', {
          cowId: illness?.cowEntity?.cowId,
        });
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );

  const handleStartDateChange = (_: any, selectedDate: any) => {
    setStartDate(selectedDate?.toISOString());
  };

  const handleEndDateChange = (_: any, selectedDate: any) => {
    setEndDate(selectedDate?.toISOString());
  };

  const onSubmit = async (values: IllnessPayload) => {
    const payload: IllnessPayload = {
      ...values,
      startDate,
      endDate,
    };
    mutate(payload);
  };

  const formattedStartDate = convertToDDMMYYYY(
    new Date(startDate).toISOString().split('T')[0]
  );
  const formattedEndDate = endDate
    ? convertToDDMMYYYY(new Date(endDate).toISOString().split('T')[0])
    : 'N/A';

  return (
    <CardComponent style={styles.container}>
      <CardComponent.Title
        title={'Illness Record'}
        subTitle={
          isEditing ? 'Edit the illness details' : 'View illness details'
        }
        leftContent={(props: any) => (
          <LeftContent {...props} icon="cards-heart" />
        )}
      />
      <CardComponent.Content>
        {!isEditing ? (
          // Read-only view
          <View>
            <Text style={styles.label}>Severity:</Text>
            <Text style={styles.value}>{illness.severity || 'N/A'}</Text>

            <View style={styles.dateContainer}>
              <View>
                <Text style={styles.label}>Start Date:</Text>
                <Text style={styles.value}>{formattedStartDate}</Text>
              </View>
              <View>
                <Ionicons name="arrow-forward" size={20} color="#000" />
                {/* Replaced faArrowRight with arrow-forward */}
              </View>
              <View>
                <Text style={styles.label}>End Date:</Text>
                <Text style={styles.value}>{formattedEndDate}</Text>
              </View>
            </View>

            <Text style={styles.label}>Prognosis:</Text>
            <View>
              <RenderHtmlComponent htmlContent={illness.prognosis} />
            </View>

            <Text style={styles.label}>Symptoms:</Text>
            <View>
              <RenderHtmlComponent htmlContent={illness.symptoms} />
            </View>
            <Button
              mode="contained"
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </View>
        ) : (
          // Editable form
          <>
            <FormItem
              control={control}
              label="Severity"
              name="severity"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomPicker
                  onValueChange={onChange}
                  selectedValue={value}
                  options={[
                    { label: 'Mild', value: 'mild' },
                    { label: 'Moderate', value: 'moderate' },
                    { label: 'Severe', value: 'severe' }, // Corrected "Severity" to "Severe"
                    { label: 'Critical', value: 'critical' },
                  ]}
                />
              )}
            />

            <View style={styles.dateContainer}>
              <View style={{ width: '48%' }}>
                <FormItem
                  control={control}
                  label="Start Date"
                  name="startDate"
                  render={() => (
                    <DateTimePicker
                      value={new Date(startDate)}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={handleStartDateChange}
                    />
                  )}
                />
              </View>

              <View style={{ width: '48%' }}>
                <FormItem
                  control={control}
                  label="End Date"
                  name="endDate"
                  render={() => (
                    <DateTimePicker
                      value={endDate ? new Date(endDate) : new Date()}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={handleEndDateChange}
                      minimumDate={new Date(startDate)}
                    />
                  )}
                />
              </View>
            </View>

            <FormItem
              control={control}
              label="Prognosis"
              name="prognosis"
              rules={{ required: 'Must not be empty' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextEditorComponent
                  onChange={onChange}
                  value={value}
                  error={errors?.prognosis?.message}
                />
              )}
            />

            <FormItem
              control={control}
              label="Symptoms"
              name="symptoms"
              rules={{ required: 'Must not be empty' }}
              render={({ field: { onChange, value } }) => (
                <TextEditorComponent
                  onChange={onChange}
                  value={value}
                  error={errors?.symptoms?.message}
                />
              )}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
              >
                Save
              </Button>
              <Button
                mode="outlined"
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </View>
          </>
        )}
      </CardComponent.Content>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    marginBottom: 10,
    color: '#333',
  },
  editButton: {
    marginTop: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
  },
});

export default IllnessCowRecordForm;
