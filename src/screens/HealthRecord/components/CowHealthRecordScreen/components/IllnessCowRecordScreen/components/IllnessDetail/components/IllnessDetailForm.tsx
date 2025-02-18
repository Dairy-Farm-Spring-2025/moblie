import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import apiClient from '@config/axios/axios';
import { IllnessDetail, UserProfileData } from '@model/Cow/Cow';
import { IllnessDetailPayload } from '@model/HealthRecord/HealthRecord';
import { Item } from '@model/Item/Item';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useRoute } from '@react-navigation/native';
import { OPTIONS_ILLNESS_DETAIL_STATUS } from '@services/data/healthStatus';
import { getAvatar } from '@utils/getImage';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';

type RootStackParamList = {
  IllnessDetailForm: {
    illnessDetail: IllnessDetail;
    illnessId: number;
    refetch: any;
  };
};

type IllnessDetailFormRouteProp = RouteProp<
  RootStackParamList,
  'IllnessDetailForm'
>;

const fetchVeterinarians = async (): Promise<UserProfileData> => {
  const response = await apiClient.get(`/users/veterinarians`);
  return response.data;
};

const fetchVeterinariansProfile = async (
  id: string
): Promise<UserProfileData> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

const fetchItem = async (): Promise<Item> => {
  const response = await apiClient.get(`/items`);
  return response.data;
};

const fetchItemDetail = async (id: string): Promise<Item> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

const IllnessDetailForm = () => {
  const route = useRoute<IllnessDetailFormRouteProp>();
  const { illnessDetail, illnessId, refetch } = route.params;
  const [idVet, setIdVet] = useState(illnessDetail.veterinarian.id.toString());
  const [idItem, setIdItem] = useState(illnessDetail.vaccine.itemId.toString());
  const [date, setDate] = useState(new Date(illnessDetail.date).toISOString());
  const [optionVeterinarian, setOptionVeterinarian] = useState<any[]>([]);
  const [optionsItemVaccine, setOptionsItemVaccine] = useState<any[]>([]);
  console.log(illnessDetail);
  const { data: veterinarians } = useQuery<UserProfileData[]>(
    'veterinarians',
    fetchVeterinarians as any
  );
  const { data: veterinarianProfile } = useQuery<UserProfileData>(
    ['veterinarians', idVet],
    () => fetchVeterinariansProfile(idVet)
  );
  const { data: itemDetail } = useQuery<Item>(['items', idItem], () =>
    fetchItemDetail(idItem)
  );
  const { data: items } = useQuery<Item[]>('items', fetchItem as any);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IllnessDetailPayload>({
    defaultValues: {
      description: illnessDetail?.description,
      illnessId: illnessId,
      itemId: illnessDetail?.vaccine?.itemId,
      status: illnessDetail?.status,
      veterinarianId: illnessDetail?.veterinarian?.id,
    },
  });

  useEffect(() => {
    if (veterinarians) {
      const filteredVete = veterinarians.map((element: UserProfileData) => ({
        value: element.id,
        label: element.name,
      }));
      setOptionVeterinarian(filteredVete);
    }
    if (items) {
      setOptionsItemVaccine(
        items
          .filter(
            (element: Item) => element?.categoryEntity?.name === 'Vaccine'
          )
          .map((element) => ({
            value: element.itemId,
            label: element.name,
          }))
      );
    }
  }, [veterinarians]);

  const handleStartDateChange = (_: any, selectedDate: any) => {
    setDate(selectedDate?.toISOString());
  };

  const { mutate } = useMutation(
    async (data: IllnessDetailPayload) =>
      await apiClient.put(
        `illness-detail/${illnessDetail.illnessDetailId}`,
        data
      ),
    {
      onSuccess: (response: any) => {
        Alert.alert('Success', response.message);
        refetch();
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );

  const onSubmit = async (values: IllnessDetailPayload) => {
    const payload: IllnessDetailPayload = {
      ...values,
      date,
    };
    mutate(payload);
  };
  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 10,
      }}
    >
      <CardComponent>
        <CardComponent.Title
          title={'Illness Detail'}
          subTitle="You can edit information"
          leftContent={(props: any) => (
            <LeftContent {...props} icon="cards-heart" />
          )}
        />
        <CardComponent.Content>
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
                label="Date"
                name="date"
                render={({ field: {} }) => (
                  <DateTimePicker
                    value={new Date(date)}
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
                label="Status"
                name="status"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    onValueChange={onChange}
                    selectedValue={value}
                    options={OPTIONS_ILLNESS_DETAIL_STATUS}
                  />
                )}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <FormItem
              control={control}
              label="Veterinarian"
              name="veterinarianId"
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  onValueChange={(value) => {
                    onChange(value);
                    setIdVet(value);
                  }}
                  selectedValue={value}
                  options={optionVeterinarian}
                />
              )}
            />
            {veterinarianProfile && (
              <CardComponent style={styles.card}>
                <CardComponent.Title
                  title={veterinarianProfile.name}
                  subTitle={veterinarianProfile.dob}
                  leftContent={() => (
                    <Avatar.Image
                      source={{
                        uri: getAvatar(veterinarianProfile.profilePhoto),
                      }}
                      size={45}
                    />
                  )}
                />
              </CardComponent>
            )}
            <FormItem
              control={control}
              label="Item"
              name="itemId"
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  onValueChange={(value) => {
                    onChange(value);
                    setIdItem(value);
                  }}
                  selectedValue={value}
                  options={optionsItemVaccine}
                />
              )}
            />
            {itemDetail && (
              <CardComponent style={styles.card}>
                <CardComponent.Title
                  title={itemDetail?.name}
                  subTitle={`Quantity: ${itemDetail?.quantity} (${itemDetail?.unit})`}
                />
                <CardComponent.Content>
                  <View style={styles.cardItem}>
                    <Text>Status: {itemDetail?.status}</Text>
                    <Text>
                      Warehouse: {itemDetail?.warehouseLocationEntity?.name}
                    </Text>
                  </View>
                </CardComponent.Content>
              </CardComponent>
            )}
            <FormItem
              control={control}
              label="Description"
              name="description"
              rules={{
                required: 'Must not be empty',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextEditorComponent
                  onChange={onChange}
                  value={value}
                  error={errors?.description?.message}
                />
              )}
            />
            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
          </View>
        </CardComponent.Content>
      </CardComponent>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    marginBottom: 10,
  },
});

export default IllnessDetailForm;
