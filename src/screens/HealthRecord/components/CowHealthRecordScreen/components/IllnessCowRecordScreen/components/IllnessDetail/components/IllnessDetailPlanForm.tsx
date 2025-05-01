import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import apiClient from '@config/axios/axios';
import { RouteProp, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Item } from '@model/Item/Item';
import FormItem from '@components/Form/FormItem';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import CardComponent from '@components/Card/CardComponent';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import { IllnessDetailPlan, IllnessDetailPlanPayload } from '@model/HealthRecord/HealthRecord';
import { t } from 'i18next';

type RootStackParamList = {
  IllnessDetailPlanForm: {
    illnessId: number;
    refetch: any;
  };
};

type IllnessDetailPlanFormRouteProp = RouteProp<RootStackParamList, 'IllnessDetailPlanForm'>;

const fetchItem = async (): Promise<Item[]> => {
  const response = await apiClient.get(`/items`);
  return response.data;
};

const fetchItemDetail = async (id: string): Promise<Item> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

const IllnessDetailPlanForm = () => {
  const route = useRoute<IllnessDetailPlanFormRouteProp>();
  const { illnessId, refetch } = route.params;
  const [optionsItemVaccine, setOptionsItemVaccine] = useState<any[]>([]);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [selectedItemDetails, setSelectedItemDetails] = useState<(Item | null)[]>([]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IllnessDetailPlan>({
    defaultValues: {
      fields: [
        {
          date: new Date().toISOString(),
          description: '',
          itemId: '',
          illnessId: illnessId,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const { data: items } = useQuery<Item[]>('items', fetchItem);

  useEffect(() => {
    if (items) {
      setOptionsItemVaccine(
        items
          .filter((item) => item.categoryEntity?.name === 'Vaccine')
          .map((item) => ({ value: item.itemId, label: item.name }))
      );
    }
  }, [items]);

  const handleItemSelect = async (itemId: string, index: number) => {
    try {
      const details = await fetchItemDetail(itemId);
      setSelectedItemDetails((prev) => {
        const updatedDetails = [...prev];
        updatedDetails[index] = details;
        return updatedDetails;
      });
    } catch (error: any) {
      Alert.alert(t('Error'), error.response.data.message || 'Failed to fetch item details');
    }
  };

  const handleDateChange = (selectedDate: Date | undefined, index: number) => {
    if (selectedDate) {
      const newDate = selectedDate.toISOString();

      setDate((prev) => {
        const updatedDates = [...prev];
        updatedDates[index] = newDate;
        return updatedDates;
      });

      // Also update the form field directly
      setValue(`fields.${index}.date`, newDate);
    }
  };

  const { mutate } = useMutation(
    async (data: IllnessDetailPlanPayload[]) =>
      await apiClient.post(`illness-detail/create-plan`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message);
        refetch();
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  const onSubmit = (data: any) => {
    mutate(data.fields);
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {fields.map((field, index) => (
            <CardComponent key={field.id}>
              <CardComponent.Title
                title={`Field ${index + 1}`}
                subTitle={`Create the plan ${index + 1} for this illness`}
              />
              <CardComponent.Content
                style={{
                  flexDirection: 'column',
                  gap: 15,
                }}
              >
                {/* Date Field */}
                <FormItem
                  name={`fields.${index}.date`}
                  control={control}
                  label='Date'
                  rules={{ required: 'Date is required' }}
                  error={errors.fields?.[index]?.date?.message}
                  render={({}) => (
                    <DateTimePicker
                      value={new Date(date[index] || new Date().toISOString())}
                      mode='date'
                      is24Hour={true}
                      display='default'
                      onChange={(_, selectedDate) => handleDateChange(selectedDate, index)}
                    />
                  )}
                />
                <FormItem
                  name={`fields.${index}.description`}
                  control={control}
                  label='Description'
                  rules={{
                    required: 'Must not be empty',
                  }}
                  error={errors.fields?.[index]?.description?.message}
                  render={({ field: { onChange, value } }) => (
                    <TextEditorComponent onChange={onChange} value={value} />
                  )}
                />
                {/* Item Picker */}
                <FormItem
                  name={`fields.${index}.itemId`}
                  control={control}
                  label='Item'
                  rules={{
                    required: 'Must not be empty',
                  }}
                  error={errors.fields?.[index]?.itemId?.message}
                  render={({ field: { onChange, value } }) => (
                    <CustomPicker
                      selectedValue={value}
                      onValueChange={async (selectedValue) => {
                        onChange(selectedValue); // Update the form field
                        await handleItemSelect(selectedValue, index); // Fetch details
                      }}
                      options={optionsItemVaccine}
                    />
                  )}
                />
                {selectedItemDetails[index] && (
                  <CardComponent style={styles.card}>
                    <CardComponent.Title
                      title={selectedItemDetails[index]?.name}
                      subTitle={`Quantity: ${selectedItemDetails[index]?.quantity} (${selectedItemDetails[index]?.unit})`}
                    />
                    <CardComponent.Content>
                      <View style={styles.cardItem}>
                        <Text>Status: {selectedItemDetails[index]?.status}</Text>
                        <Text>
                          Warehouse: {selectedItemDetails[index]?.warehouseLocationEntity?.name}
                        </Text>
                      </View>
                    </CardComponent.Content>
                  </CardComponent>
                )}
                {/* Remove Field Button */}
                {index > 0 && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => remove(index)}>
                    <Text style={styles.removeButtonText}>Remove Field</Text>
                  </TouchableOpacity>
                )}
              </CardComponent.Content>
            </CardComponent>
          ))}
        </View>
      </ScrollView>
      <FloatingButton
        onPress={() =>
          append({
            date: new Date().toISOString(),
            description: '',
            itemId: optionsItemVaccine[0]?.value || 0,
            illnessId: illnessId,
          })
        }
        style={{
          bottom: 120,
        }}
      />

      <FloatingButton
        onPress={handleSubmit(onSubmit)}
        style={{
          bottom: 40,
          backgroundColor: 'green',
        }}
        icon={'checkmark-outline'}
      />
    </View>
  );
};

export default IllnessDetailPlanForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  itemDetails: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 8,
  },
  cardItem: {
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    marginBottom: 10,
  },
});
