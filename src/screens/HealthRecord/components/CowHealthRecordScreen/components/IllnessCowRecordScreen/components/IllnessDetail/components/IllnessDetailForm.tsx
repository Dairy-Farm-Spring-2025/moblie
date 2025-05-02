import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text, Modal, TextInput, Title } from 'react-native-paper';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import FormItem from '@components/Form/FormItem';
import apiClient from '@config/axios/axios';
import { IllnessDetail, UserProfileData } from '@model/Cow/Cow';
import { IllnessDetailPayload } from '@model/HealthRecord/HealthRecord';
import { Item } from '@model/Item/Item';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';
import { COLORS } from '@common/GlobalStyle';
import { formatCamelCase } from '@utils/format';
import { getAvatar } from '@utils/getImage';
import { Alert } from 'react-native';
import { Avatar } from 'react-native-paper';
import dayjs from 'dayjs';
import { t } from 'i18next';

type RootStackParamList = {
  IllnessDetailForm: { illnessDetail: IllnessDetail; taskId?: number };
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

// Export material function (taken from InjectionScreen)
const exportMaterial = async ({
  itemId,
  taskId,
  quantity,
}: {
  itemId: number | undefined;
  taskId?: number;
  quantity: number;
}) => {
  const response = await apiClient.post('/export_items/create', {
    quantity,
    itemId,
    ...(taskId && { taskId }),
  });
  return response.data;
};

const IllnessDetailForm = () => {
  const route = useRoute<IllnessDetailFormRouteProp>();
  const { illnessDetail, taskId } = route.params;
  const navigation = useNavigation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [idItem, setIdItem] = useState(illnessDetail.vaccine.itemId);
  const [date, setDate] = useState(new Date(illnessDetail.date).toISOString());
  const [optionsItemVaccine, setOptionsItemVaccine] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // State for export modal
  const [quantity, setQuantity] = useState(''); // State for export quantity

  const OPTIONS_ILLNESS_DETAIL_STATUS = [
    { label: t('Observed'), value: 'observed' },
    { label: t('Treated'), value: 'treated' },
    { label: t('Cured'), value: 'cured' },
    { label: t('Ongoing'), value: 'ongoing' },
    { label: t('Deceased'), value: 'deceased' },
  ];

  const { roleName, userId } = useSelector((state: RootState) => state.auth);
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
        return '#52c41a';
      case 'in_progress':
        return '#1890ff';
      case 'pending':
        return '#ffa940';
      default:
        return '#8c8c8c';
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

  const { mutate: updateIllnessDetail } = useMutation(
    async (data: IllnessDetailPayload) => {
      const res = await apiClient.put(`/illness-detail/${illnessDetail.illnessDetailId}`, data);
      return res.data;
    },
    {
      onSuccess: (response: any) => {
        Alert.alert(
          t('illness_detail.success', { defaultValue: 'Success' }),
          response.message ||
            t('illness_detail.success_message', {
              defaultValue: 'Illness detail updated successfully',
            })
        );
        setIsEditMode(false);
      },
      onError: (error: any) => {
        Alert.alert(
          t('illness_detail.error', { defaultValue: 'Error' }),
          error.response?.data.message ||
            t('illness_detail.error_message', {
              defaultValue: 'Failed to update illness detail',
            })
        );
      },
    }
  );

  // Export mutation (taken from InjectionScreen)
  const exportMutation = useMutation(exportMaterial, {
    onSuccess: (data) => {
      Alert.alert(t('Success'), t('export_item_success', { defaultValue: 'Export item success' }));
      setModalVisible(false);
      setQuantity('');
      setTimeout(() => {
        (navigation.navigate as any)('MyExportItemScreen');
      }, 500);
    },
    onError: (error: any) => {
      Alert.alert(
        t('Error'),
        error?.response?.data?.message ||
          t('Failed to export material', { defaultValue: 'Failed to export material' })
      );
    },
  });

  const handleExport = () => {
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert(
        t('Error'),
        t('Please enter a valid quantity', { defaultValue: 'Please enter a valid quantity' })
      );
      return;
    }

    exportMutation.mutate({
      itemId: illnessDetail.vaccine?.itemId,
      taskId: taskId,
      quantity: Number(quantity),
    });
  };

  const onSubmit = async (values: IllnessDetailPayload) => {
    const payload: IllnessDetailPayload = {
      ...values,
      date: dayjs(date).format('YYYY-MM-DD'),
      description: illnessDetail.description,
      itemId: idItem,
      dosage: illnessDetail.dosage?.toString(),
      injectionSite: illnessDetail.injectionSite,
    };
    updateIllnessDetail(payload);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleShowName = () => {
    return veterinarianProfile?.id === userId
      ? `${veterinarianProfile?.name} (${t('illness_detail.you', {
          defaultValue: 'You',
        })})`
      : veterinarianProfile?.name;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CardComponent style={styles.cardContainer}>
        <CardComponent.Title
          title={t('illness_detail.title', { defaultValue: 'Illness Detail' })}
          subTitle={
            isEditMode
              ? t('illness_detail.edit_subtitle', {
                  defaultValue: 'Edit illness details',
                })
              : t('illness_detail.view_subtitle', {
                  defaultValue: 'View illness details',
                })
          }
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
                    label={t('illness_detail.date', { defaultValue: 'Date' })}
                    name='date'
                    render={() => (
                      <Text style={{ fontSize: 18, paddingHorizontal: 12, marginTop: 4 }}>
                        {new Date(date).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label={t('illness_detail.status', {
                      defaultValue: 'Status',
                    })}
                    name='status'
                    render={({ field: { onChange, value } }) => (
                      <CustomPicker
                        onValueChange={onChange}
                        selectedValue={value}
                        options={OPTIONS_ILLNESS_DETAIL_STATUS}
                        title={t(formatCamelCase(value), { defaultValue: 'Select status' })}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Injection Site (Read-Only in Edit Mode) */}
              <View style={styles.formRow}>
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label={t('illness_detail.injection_site', {
                      defaultValue: 'Injection Site',
                    })}
                    name='injectionSite'
                    render={() => (
                      <View style={[styles.tag, { backgroundColor: '#e8e8e8', marginTop: 4 }]}>
                        <Text style={[styles.tagText, { color: textColor }]}>
                          {illnessDetail.injectionSite
                            ? t(formatCamelCase(illnessDetail.injectionSite))
                            : t('illness_detail.na', { defaultValue: 'N/A' })}
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {/* Dosage (Read-Only in Edit Mode) */}
                <View style={{ width: '48%' }}>
                  <FormItem
                    control={control}
                    label={t('illness_detail.dosage', {
                      defaultValue: 'Dosage',
                    })}
                    name='dosage'
                    render={() => (
                      <View style={[styles.tag, { backgroundColor: '#e8e8e8', marginTop: 4 }]}>
                        <Text style={[styles.tagText, { color: textColor }]}>
                          {illnessDetail.dosage && illnessDetail.vaccine?.unit
                            ? `${illnessDetail.dosage} ${illnessDetail.vaccine.unit}`
                            : t('illness_detail.na', { defaultValue: 'N/A' })}
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </View>

              {/* Veterinarian Info */}
              {veterinarianProfile && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={handleShowName()}
                    subTitle={veterinarianProfile.roleId.name}
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

              {/* Item (Read-Only in Edit Mode) */}
              <FormItem
                control={control}
                label={t('illness_detail.item', { defaultValue: 'Item' })}
                name='itemId'
                render={() => (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  ></View>
                )}
              />

              {/* Additional Item Details in Card */}
              {illnessDetail.vaccine && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={illnessDetail.vaccine.name}
                    subTitle={`${t('illness_detail.quantity', {
                      defaultValue: 'Quantity',
                    })}: ${illnessDetail.dosage} (${illnessDetail.vaccine.unit})`}
                  />
                  <CardComponent.Content>
                    <View style={styles.cardItem}>
                      <Text>
                        {t('illness_detail.status', { defaultValue: 'Status' })}:{' '}
                        {illnessDetail.vaccine.status}
                      </Text>
                      <Text>
                        {t('illness_detail.warehouse', {
                          defaultValue: 'Warehouse',
                        })}
                        : {illnessDetail.vaccine.warehouseLocationEntity?.name}
                      </Text>
                    </View>
                  </CardComponent.Content>
                </CardComponent>
              )}

              {/* Description (Read-Only in Edit Mode) */}
              <FormItem
                control={control}
                label={t('illness_detail.description', {
                  defaultValue: 'Description',
                })}
                name='description'
                render={() => (
                  <View style={styles.descriptionContainer}>
                    <RenderHtmlComponent
                      htmlContent={
                        illnessDetail.description || t('illness_detail.na', { defaultValue: 'N/A' })
                      }
                    />
                  </View>
                )}
              />

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode='contained'
                  style={{ backgroundColor: getColorByRole() }}
                  onPress={handleSubmit(onSubmit)}
                >
                  {t('illness_detail.submit', { defaultValue: 'Submit' })}
                </Button>
                <Button mode='outlined' onPress={handleEditToggle}>
                  {t('illness_detail.cancel', { defaultValue: 'Cancel' })}
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
                  <Text style={[styles.textLabel, { color: textColor }]}>
                    {t('illness_detail.date', { defaultValue: 'Date' })}:
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {dayjs(illnessDetail.date).format('DD/MM/YYYY')}
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
                  <Text style={[styles.textLabel, { color: textColor }]}>
                    {t('illness_detail.status', { defaultValue: 'Status' })}:
                  </Text>
                </View>
                <View
                  style={[styles.tag, { backgroundColor: getStatusColor(illnessDetail.status) }]}
                >
                  <Text style={[styles.tagText, { color: '#fff' }]}>
                    {t(formatCamelCase(illnessDetail.status))}
                  </Text>
                </View>
              </View>

              {/* Injection Site (Read-Only) */}
              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='location-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>
                    {t('illness_detail.injection_site', {
                      defaultValue: 'Injection Site',
                    })}
                    :
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {illnessDetail.injectionSite
                      ? t(formatCamelCase(illnessDetail.injectionSite))
                      : t('illness_detail.na', { defaultValue: 'N/A' })}
                  </Text>
                </View>
              </View>

              {/* Dosage (Read-Only) */}
              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons name='medkit-outline' size={20} color={textColor} style={styles.icon} />
                  <Text style={[styles.textLabel, { color: textColor }]}>
                    {t('illness_detail.dosage', { defaultValue: 'Dosage' })}:
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {illnessDetail.dosage && illnessDetail.vaccine?.unit
                      ? `${illnessDetail.dosage} ${illnessDetail.vaccine.unit}`
                      : t('illness_detail.na', { defaultValue: 'N/A' })}
                  </Text>
                </View>
              </View>

              {/* Veterinarian Info */}
              {veterinarianProfile ? (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={handleShowName()}
                    subTitle={t(formatCamelCase(veterinarianProfile.roleId.name))}
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
              ) : (
                <View style={styles.infoRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name='person-outline'
                      size={20}
                      color={textColor}
                      style={styles.icon}
                    />
                    <Text style={[styles.textLabel, { color: textColor }]}>
                      {t('illness_detail.veterinarians', {
                        defaultValue: 'Veterinarians',
                      })}
                      :
                    </Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                    <Text style={[styles.tagText, { color: textColor }]}>
                      {t('illness_detail.not_assigned', {
                        defaultValue: 'Not Assigned',
                      })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Item (Read-Only) */}
              {illnessDetail.vaccine ? (
                <View style={styles.infoRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name='medkit-outline'
                      size={20}
                      color={textColor}
                      style={styles.icon}
                    />
                    <Text style={[styles.textLabel, { color: textColor }]}>
                      {t('illness_detail.item', { defaultValue: 'Item' })}:
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                      <Text style={[styles.tagText, { color: textColor }]}>
                        {illnessDetail.vaccine.name ||
                          t('illness_detail.na', { defaultValue: 'N/A' })}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.infoRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name='medkit-outline'
                      size={20}
                      color={textColor}
                      style={styles.icon}
                    />
                    <Text style={[styles.textLabel, { color: textColor }]}>
                      {t('illness_detail.item', { defaultValue: 'Item' })}:
                    </Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
                    <Text style={[styles.tagText, { color: textColor }]}>
                      {t('illness_detail.na', { defaultValue: 'N/A' })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Additional Item Details in Card */}
              {illnessDetail.vaccine && (
                <CardComponent style={styles.card}>
                  <CardComponent.Title
                    title={illnessDetail.vaccine.name}
                    subTitle={`${t('illness_detail.quantity', {
                      defaultValue: 'Quantity',
                    })}: ${illnessDetail.dosage} (${illnessDetail.vaccine.unit})`}
                  />
                  <CardComponent.Content>
                    <View style={styles.cardItem}>
                      <Text>
                        {t('illness_detail.status', { defaultValue: 'Status' })}:{' '}
                        {t(formatCamelCase(illnessDetail.vaccine.status))}
                      </Text>
                      <Text>
                        {t('illness_detail.warehouse', {
                          defaultValue: 'Warehouse',
                        })}
                        :{' '}
                        {illnessDetail.vaccine.warehouseLocationEntity?.name ||
                          t('illness_detail.na', { defaultValue: 'N/A' })}
                      </Text>
                    </View>
                  </CardComponent.Content>
                  {roleName.toLowerCase() !== 'worker' &&
                    illnessDetail.status.toLowerCase() !== 'cured' && (
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: '#fff',
                          backgroundColor: COLORS.primary,
                          padding: 8,
                          borderRadius: 10,
                          marginTop: 8,
                          textAlign: 'center',
                        }}
                        onPress={() => setModalVisible(true)}
                      >
                        {t('injections.export', { defaultValue: 'Export' })}
                      </Text>
                    )}
                </CardComponent>
              )}

              {/* Description (Read-Only) */}
              <View style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name='document-text-outline'
                    size={20}
                    color={textColor}
                    style={styles.icon}
                  />
                  <Text style={[styles.textLabel, { color: textColor }]}>
                    {t('illness_detail.description', {
                      defaultValue: 'Description',
                    })}
                    :
                  </Text>
                </View>
              </View>
              <View style={styles.descriptionContainer}>
                <RenderHtmlComponent
                  htmlContent={
                    illnessDetail.description || t('illness_detail.na', { defaultValue: 'N/A' })
                  }
                />
              </View>

              {roleName.toLowerCase() !== 'worker' &&
                illnessDetail.status.toLowerCase() !== 'cured' && (
                  <Button
                    mode='contained'
                    style={{ backgroundColor: getColorByRole(), marginTop: 20 }}
                    onPress={handleEditToggle}
                  >
                    {t('illness_detail.edit', { defaultValue: 'Edit' })}
                  </Button>
                )}
            </View>
          )}
        </CardComponent.Content>
      </CardComponent>

      {/* Export Modal */}
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title>{t('injections.export_item', { defaultValue: 'Export Item' })}</Title>
        <TextInput
          label={t('injections.export_quantity', { defaultValue: 'Quantity' })}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType='numeric'
          style={styles.input}
        />
        <View style={styles.modalButtons}>
          <Button mode='outlined' onPress={() => setModalVisible(false)}>
            {t('injections.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button mode='contained' onPress={handleExport} loading={exportMutation.isLoading}>
            {t('injections.confirm', { defaultValue: 'Confirm' })}
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  cardContainer: {
    margin: 10,
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default IllnessDetailForm;
