import { COLORS } from '@common/GlobalStyle';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import { HealthRecordForm } from '@model/HealthRecord/HealthRecord';
import { useNavigation } from '@react-navigation/native';
import { COW_STATUS } from '@services/data/cowStatus';
import { OPTIONS_HEALTH_STATUS } from '@services/data/healthStatus';
import { t } from 'i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useMutation } from 'react-query';

interface CardFormHealthRecordProps {
  cowId: any;
}

const CardFormHealthRecord = ({ cowId }: CardFormHealthRecordProps) => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthRecordForm>({
    defaultValues: {
      status: 'good',
      size: 0,
      period: 'milkingCow',
      cowId,
      bodyLength: 0,
      bodyTemperature: 0,
      chestCircumference: 0,
      description: '',
      heartRate: 0,
      respiratoryRate: 0,
      ruminateActivity: 0,
    },
  });
  const { mutate } = useMutation(
    async (data: HealthRecordForm) => await apiClient.post('health-record', data),
    {
      onSuccess: (response) => {
        Alert.alert(
          t('Success'),
          response.data.message ||
            t('healthRecord.createSuccess', { defaultValue: 'Create success' })
        );
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );
  const onSubmit = async (data: HealthRecordForm) => {
    const formattedData = {
      ...data,
      size: parseFloat((data.size as any)?.toString().replace(',', '.')),
      chestCircumference: parseFloat(
        (data.chestCircumference as any)?.toString().replace(',', '.')
      ),
      bodyLength: parseFloat((data.bodyLength as any)?.toString().replace(',', '.')),
      bodyTemperature: parseFloat((data.bodyTemperature as any)?.toString().replace(',', '.')),
      heartRate: parseFloat((data.heartRate as any)?.toString().replace(',', '.')),
      respiratoryRate: parseFloat((data.respiratoryRate as any)?.toString().replace(',', '.')),
      ruminateActivity: parseFloat((data.ruminateActivity as any)?.toString().replace(',', '.')),
    };
    mutate(formattedData);
  };
  return (
    <CardComponent>
      <CardComponent.Title
        title={t('Heath Record')}
        subTitle={t('healthRecord.subTitle', {
          defaultValue: 'Fill information form',
        })}
        leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
      />
      <CardComponent.Content>
        <View style={styles.formContainer}>
          <View>
            <FormItem
              label={`🕰️ ${t('Period')}`}
              name='period'
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
          <View>
            <FormItem
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              label={`🐄 ${t('healthRecord.status', {
                defaultValue: 'Status',
              })}`}
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
              name='size'
              control={control}
              label={`📐 ${t('Size (meter)')}`}
              rules={{
                required: {
                  message: t('Required'),
                },
                pattern: {
                  value: /^[0-9]+([.,][0-9]{1,4})?$/,
                  message: t('Only numbers are allowed'),
                },
                min: {
                  value: 1,
                  message: t('Value must be greater than 0'),
                },
              }}
              error={errors?.size?.message}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputComponent.Number
                  error={errors.size ? errors.size.message : ''}
                  placeholder={t('Enter...')}
                  maxLength={5}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.,]/g, '');
                    onChange(numericValue);
                  }}
                  value={value as any}
                  returnKeyType='done' // Adds "Done" on the keyboard
                  onSubmitEditing={Keyboard.dismiss}
                  keyboardType='decimal-pad'
                />
              )}
            />
          </View>
          <View style={styles.containerField}>
            <View style={styles.containerForm}>
              <FormItem
                name='chestCircumference'
                control={control}
                label={`🎯 ${t('healthRecord.chestCircumference', {
                  defaultValue: 'Chest Circumference',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.chestCircumference?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.size ? errors.size.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View style={styles.containerForm}>
              <FormItem
                name='bodyLength'
                control={control}
                label={`📐 ${t('healthRecord.bodyLength', {
                  defaultValue: 'Body Length',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.bodyLength?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.bodyLength ? errors.bodyLength.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View style={styles.containerForm}>
              <FormItem
                name='bodyTemperature'
                control={control}
                label={`🌡️ ${t('healthRecord.bodyTemperature', {
                  defaultValue: 'Body Temperature',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.bodyTemperature?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.bodyTemperature ? errors.bodyTemperature.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View style={styles.containerForm}>
              <FormItem
                name='heartRate'
                control={control}
                label={`❤️ ${t('healthRecord.heartRate', {
                  defaultValue: 'Heart Rate',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.heartRate?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.heartRate ? errors.heartRate.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View style={styles.containerForm}>
              <FormItem
                name='respiratoryRate'
                control={control}
                label={`🫁 ${t('healthRecord.respiratoryRate', {
                  defaultValue: 'Respiratory Rate',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.respiratoryRate?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.respiratoryRate ? errors.respiratoryRate.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
            <View style={styles.containerForm}>
              <FormItem
                name='ruminateActivity'
                control={control}
                label={`🐮 ${t('healthRecord.ruminateActivity', {
                  defaultValue: 'Ruminate Activity',
                })}`}
                rules={{
                  required: {
                    message: t('Required'),
                  },
                  pattern: {
                    value: /^[0-9]+([.,][0-9]{1,4})?$/,
                    message: t('Only numbers are allowed'),
                  },
                  min: {
                    value: 1,
                    message: t('Value must be greater than 0'),
                  },
                }}
                error={errors?.ruminateActivity?.message}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputComponent.Number
                    error={errors.ruminateActivity ? errors.ruminateActivity.message : ''}
                    placeholder={t('Enter...')}
                    maxLength={5}
                    onBlur={onBlur}
                    keyboardType='decimal-pad'
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.,]/g, '');
                      onChange(numericValue);
                    }}
                    value={value as any}
                    returnKeyType='done' // Adds "Done" on the keyboard
                    onSubmitEditing={Keyboard.dismiss}
                  />
                )}
              />
            </View>
          </View>
          <View>
            <FormItem
              name='description'
              control={control}
              label={t('healthRecord.description', {
                defaultValue: 'Description',
              })}
              rules={{
                required: {
                  message: t('Required'),
                },
              }}
              error={errors?.description?.message}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputComponent
                  error={errors.description ? errors.description.message : ''}
                  editable
                  multiline
                  numberOfLines={4}
                  placeholder={t('Enter...')}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  value={value as any}
                  onSubmitEditing={Keyboard.dismiss}
                />
              )}
            />
          </View>
          <Button
            mode='contained'
            style={{
              backgroundColor: COLORS.primary,
            }}
            onPress={handleSubmit(onSubmit)}
          >
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
  containerForm: {
    width: '48%',
  },
  containerField: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
});

export default CardFormHealthRecord;
