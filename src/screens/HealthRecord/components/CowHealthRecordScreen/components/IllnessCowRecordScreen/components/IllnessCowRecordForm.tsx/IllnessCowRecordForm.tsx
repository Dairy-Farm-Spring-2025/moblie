import React, { useState } from 'react';
import { View, Alert, StyleSheet, Button } from 'react-native';
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

interface IllnessCowRecordFormProps {
  illness: IllnessCow;
}

const IllnessCowRecordForm = ({ illness }: IllnessCowRecordFormProps) => {
  const navigation = useNavigation();
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

  return (
    <CardComponent style={styles.container}>
      <CardComponent.Title
        title={'Illness Record'}
        subTitle={'Enter your exam'}
        leftContent={(props: any) => (
          <LeftContent {...props} icon="cards-heart" />
        )}
      />
      <CardComponent.Content>
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
                { label: 'Severity', value: 'severity' },
                { label: 'Critical', value: 'critical' },
              ]}
            />
          )}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 20,
          }}
        >
          <View style={{ width: '48%' }}>
            <FormItem
              control={control}
              label="Start Date"
              name="startDate"
              render={({ field: {} }) => (
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
              render={({ field: {} }) => (
                <DateTimePicker
                  value={new Date(endDate)}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={new Date(startDate)} // Ensure end date is after the start date
                />
              )}
            />
          </View>
        </View>

        <FormItem
          control={control}
          label="Prognosis"
          name="prognosis"
          rules={{
            required: 'Must not be empty',
          }}
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
          rules={{
            required: 'Must not be empty',
          }}
          render={({ field: { onChange, value } }) => (
            <TextEditorComponent
              onChange={onChange}
              value={value}
              error={errors?.symptoms?.message}
            />
          )}
        />

        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </CardComponent.Content>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 20,
  },
});

export default IllnessCowRecordForm;
