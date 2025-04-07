import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import { HealthRecordForm } from '@model/HealthRecord/HealthRecord';
import { useNavigation } from '@react-navigation/native';
import { COW_STATUS } from '@services/data/cowStatus';
import { OPTIONS_HEALTH_STATUS } from '@services/data/healthStatus';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useMutation } from 'react-query';

interface CardFormHealthRecordProps {
  cowId: any;
}

const CardFormHealthRecord = ({ cowId }: CardFormHealthRecordProps) => {
  const navigation = useNavigation();
  const {t} = useTranslation(); 
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthRecordForm>({
    defaultValues: {
      status: 'good',
      weight: 0,
      size: 0,
      period: 'milkingCow',
      cowId,
    },
  });
  const { mutate } = useMutation(
    async (data: HealthRecordForm) =>
      await apiClient.post('health-record', data),
    {
      onSuccess: () => {
        Alert.alert('Success', 'Cow created successfully');
        navigation.goBack();
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
    <CardComponent>
      <CardComponent.Title
        title={t('Heath Record')}
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
                width: '50%',
              }}
            >
              <FormItem
                name="weight"
                control={control}
                label={t("Weight (kilogram)")}
                rules={{
                  required: {
                    message: 'Required',
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: 'Only numbers are allowed',
                  },
                  min: {
                    value: 1,
                    message: 'Weight must be greater than 0',
                  },
                }}
                error={errors?.weight?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.size ? errors.size.message : ''}
                    placeholder="Enter your weight"
                    maxLength={3}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType="done" // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View
              style={{
                width: '50%',
              }}
            >
              <FormItem
                name="size"
                control={control}
                label={t("Size (meter)")}
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
                    value={value as any}
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
              label={t("Status")}
              error={errors?.status?.message}
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  options={OPTIONS_HEALTH_STATUS}
                  selectedValue={value}
                  onValueChange={onChange}
                />
              )}
            />
          </View>

          <View>
            <FormItem
              label={t("Period")}
              name="period"
              control={control}
              rules={{ required: 'Period is required' }}
              error={errors?.period?.message}
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  options={COW_STATUS}
                  selectedValue={value}
                  onValueChange={onChange}
                />
              )}
            />
          </View>
          <Button mode="contained" onPress={handleSubmit(onSubmit)}>
            {t('Submit')}
          </Button>
        </View>
      </CardComponent.Content>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flexDirection: 'column',
    gap: 20,
  },
});

export default CardFormHealthRecord;
