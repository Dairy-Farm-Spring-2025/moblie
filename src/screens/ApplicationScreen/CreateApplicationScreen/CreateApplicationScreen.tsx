import ButtonComponent from '@components/Button/ButtonComponent';
import ContainerComponent from '@components/Container/ContainerComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import { ApplicationPayload } from '@model/Application/Application';
import { ApplicationType } from '@model/Application/ApplicationType';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { ActivityIndicator, Text } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import DividerUI from '@components/UI/DividerUI';
import { useNavigation } from '@react-navigation/native';

const fetchApplicationType = async (): Promise<ApplicationType[]> => {
  const response = await apiClient.get('application-type');
  return response.data;
};

const CreateApplicationScreen = () => {
  const [typeValue, setTypeValue] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const navigation = useNavigation();
  const {
    data: dataAppType,
    isLoading,
    isError,
    error,
  } = useQuery<ApplicationType[]>('/application-type', fetchApplicationType);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationPayload>({
    mode: 'onTouched', // Makes validation trigger on blur
    defaultValues: {
      title: undefined,
      content: undefined,
      fromDate: undefined,
      toDate: undefined,
      typeId: undefined,
    },
  });

  const { mutate } = useMutation(
    async (data: ApplicationPayload) => await apiClient.post(`application/request`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message);
        (navigation as any).navigate('ViewApplicationScreen');
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  const onSubmit = (data: ApplicationPayload) => {
    const { fromDate, toDate, ...rest } = data;
    const payload = {
      fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
      toDate: dayjs(toDate).format('YYYY-MM-DD'),
      ...rest,
    };
    mutate(payload);
  };

  const handleFromDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || fromDate;
    setFromDate(currentDate);
  };

  const handleToDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || toDate;
    setToDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <Text style={{ color: 'red' }}>{(error as any).message}</Text>
        ) : (
          <ContainerComponent.ScrollView>
            <View
              style={{
                padding: 10,
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  📝
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '500',
                  }}
                >
                  {t('application.licenseTitle', {
                    defaultValue: 'License application',
                  })}
                </Text>
              </View>
              <DividerUI />
              <View
                style={{
                  flexDirection: 'column',
                  gap: 9,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={styles.license}>
                  {t('application.license1', {
                    defaultValue: 'Application will be send to Manager',
                  })}
                </Text>
                <Text style={styles.license}>
                  {t('application.license2', {
                    defaultValue: 'Application will be checked by Manager in 24h',
                  })}
                </Text>
                <Text
                  style={[
                    styles.license,
                    {
                      color: 'red',
                    },
                  ]}
                >
                  {t('application.license3', {
                    defaultValue:
                      'You must provide full information for each application type. Manager will base on this information to approve or deny your application',
                  })}
                </Text>
              </View>
              <DividerUI />
            </View>
            <View
              style={{
                paddingHorizontal: 10,
              }}
            >
              <CardComponent>
                <CardComponent.Title
                  title={t('application.titleCreate', {
                    defaultValue: 'Create application',
                  })}
                  subTitle={t('application.subTitle', {
                    defaultValue: 'Fill all the request',
                  })}
                  leftContent={(props: any) => <LeftContent {...props} icon='plus' />}
                />
                <DividerUI />
                <CardComponent.Content>
                  <View style={styles.containerForm}>
                    <FormItem
                      control={control}
                      name='typeId'
                      label={t('application.applicationType', {
                        defaultValue: 'Application type',
                      })}
                      rules={{
                        required: t('validateForm.required'),
                      }}
                      error={errors.typeId ? errors.typeId.message : null}
                      render={({ field: { onChange, value } }) => {
                        const options =
                          dataAppType?.map((item) => ({
                            label: item.name,
                            value: item.applicationId.toString(),
                          })) || [];
                        return (
                          <CustomPicker
                            options={options}
                            selectedValue={value || ''} // Should be '' initially
                            onValueChange={(selected) => {
                              onChange(selected); // Update form state
                              setTypeValue(selected); // Update local state
                            }}
                          />
                        );
                      }}
                    />

                    {/* Title Field */}
                    {typeValue !== '' && (
                      <>
                        <FormItem
                          control={control}
                          name='title'
                          label={t('application.titleFormItem', {
                            defaultValue: 'Title',
                          })}
                          rules={{
                            required: t('validateForm.required'),
                          }}
                          error={errors.title ? errors.title.message : null}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInputComponent
                              error={errors.title ? errors.title.message : ''}
                              placeholder={t('Enter...')}
                              onBlur={onBlur}
                              onChangeText={(text) => {
                                onChange(text);
                              }}
                              value={value as any}
                              returnKeyType='done'
                            />
                          )}
                        />
                        <FormItem
                          control={control}
                          name='content'
                          label={t('application.content', {
                            defaultValue: 'Content',
                          })}
                          rules={{
                            required: t('validateForm.required'),
                          }}
                          error={errors.content ? errors.content.message : null}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInputComponent
                              error={errors.content ? errors.content.message : ''}
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

                        {/* From Date Field */}
                        <View style={styles.containerDate}>
                          <FormItem
                            control={control}
                            name='fromDate'
                            label={t('application.fromDate', {
                              defaultValue: 'From Date',
                            })}
                            rules={{
                              required: t('validateForm.required'),
                            }}
                            error={errors.fromDate ? errors.fromDate.message : null}
                            render={({ field: { onChange, value } }) => (
                              <DateTimePicker
                                value={fromDate || new Date()}
                                mode='date'
                                is24Hour={true}
                                display='default'
                                minimumDate={new Date()}
                                onChange={(e, date) => {
                                  handleFromDateChange(e, date);
                                  onChange(date);
                                }}
                              />
                            )}
                          />

                          {/* To Date Field */}
                          <FormItem
                            control={control}
                            name='toDate'
                            label={t('application.toDate', {
                              defaultValue: 'To Date',
                            })}
                            rules={{
                              required: t('validateForm.required'),
                            }}
                            error={errors.toDate ? errors.toDate.message : null}
                            render={({ field: { onChange, value } }) => (
                              <DateTimePicker
                                value={toDate || new Date()}
                                mode='date'
                                is24Hour={true}
                                display='default'
                                minimumDate={fromDate || new Date()} // To date should be after from date
                                onChange={(e, date) => {
                                  handleToDateChange(e, date);
                                  onChange(date);
                                }}
                              />
                            )}
                          />
                        </View>
                      </>
                    )}

                    {/* Submit Button */}
                    <ButtonComponent type='primary' onPress={handleSubmit(onSubmit)}>
                      {t('application.submitButton', {
                        defaultValue: 'Submit',
                      })}
                    </ButtonComponent>
                  </View>
                </CardComponent.Content>
              </CardComponent>
            </View>
          </ContainerComponent.ScrollView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  containerForm: {
    flexDirection: 'column',
    gap: 20,
  },
  containerDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  license: {
    fontSize: 15,
    fontWeight: '500',
    fontStyle: 'italic',
    textDecorationStyle: 'solid',
    textAlign: 'justify',
  },
});

export default CreateApplicationScreen;
