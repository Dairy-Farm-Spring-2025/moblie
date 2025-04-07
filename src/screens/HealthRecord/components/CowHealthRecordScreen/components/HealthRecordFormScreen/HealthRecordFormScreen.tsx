import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import {
  HealthRecord,
  HealthRecordForm,
} from '@model/HealthRecord/HealthRecord';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { COW_STATUS } from '@services/data/cowStatus';
import { OPTIONS_HEALTH_STATUS } from '@services/data/healthStatus';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Keyboard, StyleSheet, View } from 'react-native';
import { useMutation } from 'react-query';

type RootStackParamList = {
  HealthRecordFormScreen: { healthRecord: HealthRecord };
};

type HealthRecordFormScreenRouteProp = RouteProp<
  RootStackParamList,
  'HealthRecordFormScreen'
>;

const HealthRecordFormScreen = () => {
  const route = useRoute<HealthRecordFormScreenRouteProp>();
  const navigation = useNavigation();
  const { healthRecord } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthRecordForm>({
    defaultValues: {
      status: healthRecord.status,
      size: healthRecord.size || 0,
      period: healthRecord.period,
      cowId: healthRecord.cowEntity.cowId,
    },
  });
  const { mutate } = useMutation(
    async (data: HealthRecordForm) =>
      await apiClient.put(
        `health-record/${healthRecord?.healthRecordId}`,
        data
      ),
    {
      onSuccess: () => {
        Alert.alert('Success', 'Cow created successfully');
        (navigation.navigate as any)('CowDetails', {
          cowId: healthRecord?.cowEntity?.cowId,
        });
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );
  const onSubmit = async (data: HealthRecordForm) => {
    mutate(data);
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <CardComponent>
        <CardComponent.Title
          title={'Heath Record'}
          subTitle={'Enter your exam'}
          leftContent={(props: any) => (
            <LeftContent {...props} icon="cards-heart" />
          )}
        />
        <CardComponent.Content>
          <View style={styles.formContainer}>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <View
                style={{
                  width: '100%',
                }}
              >
                <FormItem
                  name="size"
                  control={control}
                  label="Size (meter)"
                  rules={{
                    required: 'Size is required',
                    pattern: {
                      value: /^[0-9]*$/,
                      message: 'Only numbers are allowed',
                    },
                    min: {
                      value: 1,
                      message: 'Size must be greater than 0',
                    },
                  }}
                  error={errors?.size?.message}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInputComponent.Number
                      error={errors.size ? errors.size.message : ''}
                      placeholder="Enter your size"
                      maxLength={3}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        onChange(numericValue);
                      }}
                      value={value}
                      returnKeyType="done" // Adds "Done" on the keyboard
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <FormItem
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                label="Status"
                error={errors?.status?.message}
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    options={OPTIONS_HEALTH_STATUS()}
                    selectedValue={value}
                    onValueChange={onChange}
                  />
                )}
              />
            </View>

            <View>
              <FormItem
                label="Period"
                name="period"
                control={control}
                rules={{ required: 'Period is required' }}
                error={errors?.period?.message}
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    options={COW_STATUS()}
                    selectedValue={value}
                    onValueChange={onChange}
                  />
                )}
              />
            </View>
            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
          </View>
        </CardComponent.Content>
      </CardComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flexDirection: 'column',
    gap: 20,
  },
});

export default HealthRecordFormScreen;
