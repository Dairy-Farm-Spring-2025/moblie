import ButtonComponent from '@components/Button/ButtonComponent';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import { RootState } from '@core/store/store';
import { HealthRecord, HealthRecordForm } from '@model/HealthRecord/HealthRecord';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { COW_STATUS } from '@services/data/cowStatus';
import { OPTIONS_HEALTH_STATUS } from '@services/data/healthStatus';
import { formatCamelCase } from '@utils/format';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';

type RootStackParamList = {
  HealthRecordFormScreen: {
    healthRecord: HealthRecord;
    fromScreen: 'cow' | 'health';
  };
};

type HealthRecordFormScreenRouteProp = RouteProp<RootStackParamList, 'HealthRecordFormScreen'>;

const HealthRecordFormScreen = () => {
  const route = useRoute<HealthRecordFormScreenRouteProp>();
  const { roleName } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();
  const { healthRecord, fromScreen } = route.params;
  const [isEditing, setIsEditing] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<HealthRecordForm>({
    defaultValues: {
      status: healthRecord?.status || 'good',
      size: healthRecord?.size || 0,
      period: healthRecord?.period || 'milkingCow',
      cowId: healthRecord?.cowEntity?.cowId,
      bodyLength: healthRecord?.bodyLength || 0,
      bodyTemperature: healthRecord?.bodyTemperature || 0,
      chestCircumference: healthRecord?.chestCircumference || 0,
      description: healthRecord?.description || '',
      heartRate: healthRecord?.heartRate || 0,
      respiratoryRate: healthRecord?.respiratoryRate || 0,
      ruminateActivity: healthRecord?.ruminateActivity || 0,
    },
  });

  useEffect(() => {
    if (healthRecord) {
      reset({
        status: healthRecord.status,
        size: healthRecord.size,
        period: healthRecord.period,
        cowId: healthRecord.cowEntity?.cowId,
        bodyLength: healthRecord.bodyLength,
        bodyTemperature: healthRecord.bodyTemperature,
        chestCircumference: healthRecord.chestCircumference,
        description: healthRecord.description,
        heartRate: healthRecord.heartRate,
        respiratoryRate: healthRecord.respiratoryRate,
        ruminateActivity: healthRecord.ruminateActivity,
      });
    }
  }, [healthRecord, reset]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset({
      status: healthRecord.status,
      size: healthRecord.size,
      period: healthRecord.period,
      cowId: healthRecord.cowEntity?.cowId,
      bodyLength: healthRecord.bodyLength,
      bodyTemperature: healthRecord.bodyTemperature,
      chestCircumference: healthRecord.chestCircumference,
      description: healthRecord.description,
      heartRate: healthRecord.heartRate,
      respiratoryRate: healthRecord.respiratoryRate,
      ruminateActivity: healthRecord.ruminateActivity,
    });
  };

  const { mutate } = useMutation(
    async (data: HealthRecordForm) =>
      await apiClient.put(`health-record/${healthRecord?.healthRecordId}`, data),
    {
      onSuccess: () => {
        Alert.alert('Success', t('Update health record success'));
        setIsEditing(false);
        if (fromScreen === 'cow') {
          (navigation.navigate as any)('CowDetails', {
            cowId: healthRecord?.cowEntity?.cowId,
          });
        } else {
          (navigation.navigate as any)('HealthRecordScreen');
        }
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );

  const onSubmit = async (data: HealthRecordForm) => {
    const formattedData = {
      ...data,
      size: data.size ? parseFloat(data.size.toString().replace(',', '.')) : 0,
      chestCircumference: data.chestCircumference
        ? parseFloat(data.chestCircumference.toString().replace(',', '.'))
        : 0,
      bodyLength: data.bodyLength ? parseFloat(data.bodyLength.toString().replace(',', '.')) : 0,
      bodyTemperature: data.bodyTemperature ? parseInt(data.bodyTemperature.toString(), 10) : 0,
      heartRate: data.heartRate ? parseInt(data.heartRate.toString(), 10) : 0,
      respiratoryRate: data.respiratoryRate ? parseInt(data.respiratoryRate.toString(), 10) : 0,
      ruminateActivity: data.ruminateActivity ? parseInt(data.ruminateActivity.toString(), 10) : 0,
    };
    mutate(formattedData);
  };

  const formValues = watch();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps='handled'
      >
        <CardComponent>
          <CardComponent.Title
            title={t('Heath Record')}
            subTitle={t('healthRecord.subTitle', {
              defaultValue: isEditing ? 'Fill information form' : 'View health record',
            })}
            leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
          />
          <CardComponent.Content>
            {isEditing ? (
              <View style={styles.formContainer}>
                <View>
                  <FormItem
                    label={`🕰️ ${t('Period')}`}
                    name='period'
                    control={control}
                    rules={{ required: t('Period is required') }}
                    error={errors?.period?.message}
                    render={({ field: { onChange, value } }) => (
                      <CustomPicker
                        options={COW_STATUS()}
                        selectedValue={value}
                        onValueChange={onChange}
                        readOnly={!isEditing}
                      />
                    )}
                  />
                </View>
                <View>
                  <FormItem
                    name='status'
                    control={control}
                    rules={{ required: t('Status is required') }}
                    label={`🐄 ${t('healthRecord.status', { defaultValue: 'Status' })}`}
                    error={errors?.status?.message}
                    render={({ field: { onChange, value } }) => (
                      <CustomPicker
                        options={OPTIONS_HEALTH_STATUS()}
                        selectedValue={value}
                        onValueChange={onChange}
                        readOnly={!isEditing}
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
                      required: { message: t('Required') },
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
                        value={value ? value.toString() : ''}
                        returnKeyType='done'
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
                        required: { message: t('Required') },
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
                          error={errors.chestCircumference ? errors.chestCircumference.message : ''}
                          placeholder={t('Enter...')}
                          maxLength={5}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.,]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
                          onSubmitEditing={Keyboard.dismiss}
                          keyboardType='decimal-pad'
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
                        required: { message: t('Required') },
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
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.,]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
                          onSubmitEditing={Keyboard.dismiss}
                          keyboardType='decimal-pad'
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
                        required: { message: t('Required') },
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
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.,]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
                          onSubmitEditing={Keyboard.dismiss}
                          keyboardType='decimal-pad'
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
                        required: { message: t('Required') },
                        pattern: {
                          value: /^[0-9]+$/,
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
                          maxLength={3}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
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
                        required: { message: t('Required') },
                        pattern: {
                          value: /^[0-9]+$/,
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
                          maxLength={3}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
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
                        required: { message: t('Required') },
                        pattern: {
                          value: /^[0-9]+$/,
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
                          maxLength={3}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            onChange(numericValue);
                          }}
                          value={value ? value.toString() : ''}
                          returnKeyType='done'
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
                    label={t('healthRecord.description', { defaultValue: 'Description' })}
                    rules={{ required: { message: t('Required') } }}
                    error={errors?.description?.message}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInputComponent
                        error={errors.description ? errors.description.message : ''}
                        editable
                        multiline
                        numberOfLines={4}
                        placeholder={t('Enter...')}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value as any}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    )}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <View style={styles.editButtons}>
                    <ButtonComponent width='50%' type='volcano' onPress={handleCancelEdit}>
                      {t('Cancel')}
                    </ButtonComponent>
                    <ButtonComponent width='50%' onPress={handleSubmit(onSubmit)}>
                      {t('Confirm')}
                    </ButtonComponent>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.viewItem}>
                  <Text style={styles.viewLabel}>🕰️ {t('Period')}:</Text>
                  <Text style={styles.viewText}>
                    {formatCamelCase(
                      t(`data.cowStatus.${formValues.period}`, { defaultValue: formValues.period })
                    ) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.viewItem}>
                  <Text style={styles.viewLabel}>
                    🐄 {t('healthRecord.status', { defaultValue: 'Status' })}:
                  </Text>
                  <Text style={styles.viewText}>
                    {formatCamelCase(
                      t(`data.healthStatus.${formValues.status}`, {
                        defaultValue: formValues.status,
                      })
                    ) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.viewItem}>
                  <Text style={styles.viewLabel}>📐 {t('Size (meter)')}:</Text>
                  <Text style={styles.viewText}>
                    {formValues.size ? `${formValues.size} m` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.containerField}>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      🎯{' '}
                      {t('healthRecord.chestCircumference', {
                        defaultValue: 'Chest Circumference (meter)',
                      })}
                      :
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.chestCircumference ? `${formValues.chestCircumference} m` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      📐 {t('healthRecord.bodyLength', { defaultValue: 'Body Length (meter)' })}:
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.bodyLength ? `${formValues.bodyLength} m` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      🌡️{' '}
                      {t('healthRecord.bodyTemperature', { defaultValue: 'Body Temperature (°C)' })}
                      :
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.bodyTemperature ? `${formValues.bodyTemperature} °C` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      ❤️ {t('healthRecord.heartRate', { defaultValue: 'Heart Rate (BPM)' })}:
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.heartRate ? `${formValues.heartRate} BPM` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      🫁{' '}
                      {t('healthRecord.respiratoryRate', {
                        defaultValue: 'Respiratory Rate (times/minutes)',
                      })}
                      :
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.respiratoryRate
                        ? `${formValues.respiratoryRate} ${t('times/min', {
                            defaultValue: 'times/min',
                          })}`
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.containerForm}>
                    <Text style={styles.viewLabel}>
                      🐮{' '}
                      {t('healthRecord.ruminateActivity', {
                        defaultValue: 'Ruminate Activity (minutes/days)',
                      })}
                      :
                    </Text>
                    <Text style={styles.viewText}>
                      {formValues.ruminateActivity
                        ? `${formValues.ruminateActivity} ${t('min/day', {
                            defaultValue: 'min/day',
                          })}`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.viewTextHTML}>
                  <Text style={styles.viewLabel}>
                    {t('healthRecord.description', { defaultValue: 'Description' })}:
                  </Text>
                  <View style={{ paddingHorizontal: 10 }}>
                    <RenderHTML source={{ html: formValues.description || 'N/A' }} />
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  {!isEditing && roleName.toLowerCase() !== 'worker' && (
                    <ButtonComponent type='warning' onPress={() => setIsEditing(true)}>
                      {t('Edit')}
                    </ButtonComponent>
                  )}
                </View>
              </View>
            )}
          </CardComponent.Content>
        </CardComponent>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
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
  buttonContainer: {
    marginTop: 20,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  viewItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  viewLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginRight: 6,
  },
  viewText: {
    fontSize: 16,
    color: '#555',
  },
  viewTextHTML: {},
});

export default HealthRecordFormScreen;
