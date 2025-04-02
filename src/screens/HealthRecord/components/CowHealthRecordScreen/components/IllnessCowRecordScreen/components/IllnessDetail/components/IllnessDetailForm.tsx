import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from 'react-native-paper';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
import apiClient from '@config/axios/axios';
import { IllnessDetail, UserProfileData } from '@model/Cow/Cow';
import { IllnessDetailPayload } from '@model/HealthRecord/HealthRecord';
import { Item } from '@model/Item/Item';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';
import { COLORS } from '@common/GlobalStyle';
import { OPTION_INJECTION_SITES, OPTIONS_ILLNESS_DETAIL_STATUS } from '@services/data/healthStatus';
import { formatCamelCase } from '@utils/format';
import { getAvatar } from '@utils/getImage';
import { Alert } from 'react-native';
import { Avatar } from 'react-native-paper';
import dayjs from 'dayjs';

type RootStackParamList = {
  IllnessDetailForm: { illnessDetail: IllnessDetail };
};

type IllnessDetailFormRouteProp = RouteProp<RootStackParamList, 'IllnessDetailForm'>;

const fetchVeterinariansProfile = async (id: string): Promise<UserProfileData> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

const fetchItemDetail = async (id: string): Promise<Item> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

const fetchItems = async (): Promise<Item[]> => {
  const response = await apiClient.get(`/items`);
  return response.data;
};

const IllnessDetailForm = () => {
  const route = useRoute<IllnessDetailFormRouteProp>();
  const navigation = useNavigation();
  const { illnessDetail } = route.params;

  const [isEditMode, setIsEditMode] = useState(false);
  const [idItem, setIdItem] = useState(illnessDetail.vaccine.itemId);
  const [date, setDate] = useState(new Date(illnessDetail.date).toISOString());
  const [optionsItemVaccine, setOptionsItemVaccine] = useState<any[]>([]);

  const { roleName } = useSelector((state: RootState) => state.auth);
  const textColor = '#333';

  const getColorByRole = () => {
    switch (roleName) {
      case 'veterinarians':
        return COLORS.veterinarian.primary;
      case 'workers':
        return COLORS.worker.primary;
      default:
        return COLORS.worker.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#52c41a'; // Green
      case 'in progress':
        return '#1890ff'; // Blue
      case 'pending':
        return '#ffa940'; // Orange
      default:
        return '#8c8c8c'; // Grey
    }
  };

  const { data: veterinarianProfile } = useQuery<UserProfileData>(
    ['veterinarians', illnessDetail?.veterinarian?.id],
    () => fetchVeterinariansProfile(illnessDetail.veterinarian?.id.toString()),
    { enabled: !!illnessDetail?.veterinarian?.id }
  );

  const { data: itemDetail } = useQuery<Item>(
    ['items', idItem],
    () => fetchItemDetail(idItem.toString()),
    { enabled: !!idItem }
  );

  const { data: items } = useQuery<Item[]>('items', fetchItems);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IllnessDetailPayload>({
    defaultValues: {
      description: illnessDetail?.description,
      itemId: idItem,
      status: illnessDetail?.status,
      veterinarianId: illnessDetail?.veterinarian?.id,
      dosage: illnessDetail?.dosage?.toString(),
      injectionSite: illnessDetail?.injectionSite,
    },
  });

  useEffect(() => {
    if (items) {
      setOptionsItemVaccine(
        items
          .filter(
            (element: Item) =>
              element?.categoryEntity?.name === 'Vắc-xin' ||
              element?.categoryEntity?.name === 'Thuốc'
          )
          .map((element) => ({
            value: element.itemId,
            label: element.name,
          }))
      );
    }
  }, [items]);

  const handleStartDateChange = (_: any, selectedDate: any) => {
    setDate(selectedDate?.toISOString());
  };

  const { mutate } = useMutation(
    async (data: IllnessDetailPayload) =>
      await apiClient.put(`illness-detail/${illnessDetail.illnessDetailId}`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert('Success', response.message || 'Illness detail updated successfully');
        setIsEditMode(false); // Switch back to View Mode
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response?.data.message || 'Failed to update illness detail');
      },
    }
  );

  const onSubmit = async (values: IllnessDetailPayload) => {
    const payload: IllnessDetailPayload = {
      ...values,
      date: dayjs(date).format('YYYY-MM-DD'),
    };
    mutate(payload);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <ScrollView style={styles.container}>
      <CardComponent>
        <CardComponent.Title
          title='Illness Detail'
          subTitle={isEditMode ? 'Edit illness details' : 'View illness details'}
          leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
        />
        <CardComponent.Content>
          {isEditMode ? (
            // Edit Mode
            <View style={styles.editContainer}>
              <View style={styles.formRow}>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label='Date'
                    name='date'
                    render={() => (
                      <DateTimePicker
                        value={new Date(date)}
                        mode='date'
                        is24Hour={true}
                        display='default'
                        onChange={handleStartDateChange}
                      />
                    )}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label='Status'
                    name='status'
                    render={({ field: { onChange, value } }) => (
                      <CustomPicker
                        onValueChange={onChange}
                        selectedValue={value}
                        options={OPTIONS_ILLNESS_DETAIL_STATUS}
                        title={formatCamelCase(value)}
                      />
                    )}
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label='Injection Site'
                    name='injectionSite'
                    render={({ field: { onChange, value } }) => (
                      <CustomPicker
                        onValueChange={onChange}
                        selectedValue={value}
                        options={OPTION_INJECTION_SITES()}
                        title={formatCamelCase(value)}
                      />
                    )}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label='Dosage'
                    name='dosage'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInputComponent.Number
                        error={errors.dosage ? errors.dosage.message : ''}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, '');
                          onChange(numericValue);
                        }}
                        value={value as any}
                        returnKeyType='done'
                      />
                    )}
                  />
                </View>
              </View>
              {veterinarianProfile && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={veterinarianProfile.name}
                    subTitle={veterinarianProfile.roleId.name}
                    leftContent={() => (
                      <Avatar.Image
                        source={{ uri: getAvatar(veterinarianProfile.profilePhoto) }}
                        size={45}
                      />
                    )}
                  />
                </CardComponent>
              )}
              <FormItem
                control={control}
                label='Item'
                name='itemId'
                rules={{ required: 'Must not be empty' }}
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    onValueChange={(value) => {
                      onChange(value);
                      setIdItem(value);
                    }}
                    selectedValue={value}
                    options={optionsItemVaccine}
                    title={itemDetail?.name || 'N/A'}
                  />
                )}
              />
              {itemDetail && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={itemDetail.name}
                    subTitle={`Quantity: ${itemDetail.quantity} (${itemDetail.unit})`}
                  />
                  <CardComponent.Content>
                    <View style={styles.cardItem}>
                      <Text>Status: {itemDetail.status}</Text>
                      <Text>Warehouse: {itemDetail.warehouseLocationEntity?.name}</Text>
                    </View>
                  </CardComponent.Content>
                </CardComponent>
              )}
              <FormItem
                control={control}
                label='Description'
                name='description'
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextEditorComponent
                    onChange={onChange}
                    value={value}
                    error={errors?.description?.message}
                  />
                )}
              />
              <View style={styles.buttonRow}>
                <Button
                  mode='contained'
                  style={{ backgroundColor: getColorByRole() }}
                  onPress={handleSubmit(onSubmit)}
                >
                  Submit
                </Button>
                <Button mode='outlined' onPress={handleEditToggle}>
                  Cancel
                </Button>
              </View>
            </View>
          ) : (
            // View Mode
            <View style={styles.viewContainer}>
              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='calendar-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>Date:</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {dayjs(illnessDetail.date).format('YYYY-MM-DD')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='checkmark-circle-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>Status:</Text>
                </View>
                <View
                  style={[styles.tag, { backgroundColor: getStatusColor(illnessDetail.status) }]}
                >
                  <Text style={[styles.tagText, { color: '#fff' }]}>
                    {formatCamelCase(illnessDetail.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='location-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>Injection Site:</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {formatCamelCase(illnessDetail.injectionSite)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons name='medkit-outline' size={20} color={textColor} style={styles.icon} />
                  <Text style={[styles.textLabel, { color: textColor }]}>Dosage:</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>{illnessDetail.dosage}</Text>
                </View>
              </View>

              {veterinarianProfile ? (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={veterinarianProfile.name}
                    subTitle={veterinarianProfile.roleId.name}
                    leftContent={() => (
                      <Avatar.Image
                        source={{ uri: getAvatar(veterinarianProfile.profilePhoto) }}
                        size={45}
                      />
                    )}
                  />
                </CardComponent>
              ) : (
                <View style={styles.infoRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name='person-outline'
                      size={20}
                      color={textColor}
                      style={styles.icon}
                    />
                    <Text style={[styles.textLabel, { color: textColor }]}>Veterinarian:</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                    <Text style={[styles.tagText, { color: textColor }]}>Not Assigned</Text>
                  </View>
                </View>
              )}

              {illnessDetail.vaccine && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={illnessDetail.vaccine.name}
                    subTitle={`Quantity: ${illnessDetail.vaccine.quantity} (${illnessDetail.vaccine.unit})`}
                  />
                  <CardComponent.Content>
                    <View style={styles.cardItem}>
                      <Text>Status: {illnessDetail.vaccine.status}</Text>
                      <Text>Warehouse: {illnessDetail.vaccine.warehouseLocationEntity?.name}</Text>
                    </View>
                  </CardComponent.Content>
                </CardComponent>
              )}

              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='document-text-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>Description:</Text>
                </View>
              </View>
              <View style={styles.descriptionContainer}>
                <RenderHtmlComponent htmlContent={illnessDetail.description} />
              </View>

              <Button
                mode='contained'
                style={{ backgroundColor: getColorByRole(), marginTop: 20 }}
                onPress={handleEditToggle}
              >
                Edit
              </Button>
            </View>
          )}
        </CardComponent.Content>
      </CardComponent>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  editContainer: {
    flexDirection: 'column',
    gap: 10,
    marginVertical: 20,
  },
  viewContainer: {
    flexDirection: 'column',
    gap: 10,
    marginVertical: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    marginRight: 10,
  },
  textLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fafafa',
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  cardItem: {
    flexDirection: 'column',
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default IllnessDetailForm;
