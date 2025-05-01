import CardComponent from '@components/Card/CardComponent';
import ContainerComponent from '@components/Container/ContainerComponent';
import apiClient from '@config/axios/axios';
import { Cow, InjectionCow, InjectionStatus } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Modal, Text, TextInput, Title } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import TagUI from '@components/UI/TagUI';
import { t } from 'i18next';
import DividerUI from '@components/UI/DividerUI';
import { COLORS } from '@common/GlobalStyle';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import { getStatusItemDarkColor } from '@utils/getColorsStatus';
import { StatusItem } from '@model/Item/Item';
import CardDetailCow from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/components/CardDetailCow/CardDetailCow';
import CardCow from '@components/CardCow/CardCow';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';

type RootStackParamList = {
  InjectionScreen: { vaccineInjectionId: number; taskId?: number }; // taskId made optional
};

type InjectionScreenRouteProp = RouteProp<RootStackParamList, 'InjectionScreen'>;

const fetchVaccineInjections = async (id: number): Promise<InjectionCow> => {
  const response = await apiClient.get(`/vaccine-injections/${id}`);
  return response.data;
};

const statusColors: Record<InjectionStatus, string> = {
  pending: '#D97706', // Dark Amber
  inProgress: '#1E40AF', // Dark Blue
  completed: '#166534', // Dark Green
  canceled: '#B91C1C', // Dark Red
};

const exportMaterial = async ({
  itemId,
  taskId,
  quantity,
}: {
  itemId: number | undefined;
  taskId?: number; // Made optional
  quantity: number;
}) => {
  const response = await apiClient.post('/export_items/create', {
    quantity,
    itemId,
    ...(taskId && { taskId }), // Only include taskId if it exists
  });
  return response.data;
};

const InjectionScreen = () => {
  const route = useRoute<InjectionScreenRouteProp>();
  const { vaccineInjectionId, taskId } = route.params;
  const { roleName } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [exportTaskId, setExportTaskId] = useState<string | undefined>(taskId?.toString());
  const {
    data: injections,
    isLoading,
    isError,
    error,
  } = useQuery(['vaccine-injections', vaccineInjectionId], () =>
    fetchVaccineInjections(vaccineInjectionId)
  );
  const getStatusDarkColor = (status: InjectionStatus) => statusColors[status] || '#374151'; // Default Dark Gray

  const exportMutation = useMutation(exportMaterial, {
    onSuccess: (data, variables) => {
      Alert.alert(t('Success'), t('export_item_success', { defaultValue: 'Export item success' }));
      setModalVisible(false);
      setQuantity('');
      setExportTaskId(taskId?.toString());
      setTimeout(() => {
        (navigation.goBack as any)();
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
      itemId: injections?.vaccineCycleDetail.itemEntity.itemId,
      taskId: exportTaskId ? Number(exportTaskId) : undefined,
      quantity: Number(quantity),
    });
  };

  if (isError) {
    <Text>{(error as any)?.message}</Text>;
  }
  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <ContainerComponent.ScrollView>
      <View
        style={{
          flexDirection: 'column',
          paddingVertical: 20,
        }}
      >
        <View style={{}}>
          <Text style={[styles.title, { fontWeight: 'bold', fontSize: 22 }]}>
            {t('injections.cow', { defaultValue: 'Cow' })}
          </Text>
          <View style={{ padding: 14 }}>
            <CardCow cow={injections?.cowEntity || ({} as Cow)} />
          </View>
        </View>
        <DividerUI />
        <Text style={[styles.title, { fontWeight: 'bold', fontSize: 22 }]}>
          {t('injections.injection_info', { defaultValue: 'Injection Infomation' })}
        </Text>
        <View style={styles.containerTitle}>
          <Text style={styles.title}>
            {injections?.injectionDate ? convertToDDMMYYYY(injections?.injectionDate) : 'N/A'}
          </Text>
          <TagUI backgroundColor={getStatusDarkColor(injections?.status as InjectionStatus)}>
            {injections?.status ? t(formatCamelCase(injections?.status)) : 'N/A'}
          </TagUI>
        </View>
        <Text style={styles.description}>{injections?.description}</Text>
        <DividerUI />
        <View style={styles.detail}>
          <CardComponent>
            <Text style={styles.titleCard}>
              {t('injections.vaccineCycleDetail', {
                defaultValue: 'Vaccine Cycle Detail',
              })}
            </Text>
            <DividerUI />
            <View
              style={{
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {injections?.vaccineCycleDetail.name}
              </Text>
              <TextRenderHorizontal
                title={t('injections.dosage', { defaultValue: 'Dosage' })}
                content={`${injections?.vaccineCycleDetail.dosage} (${injections?.vaccineCycleDetail?.dosageUnit})`}
              />
              <TextRenderHorizontal
                title={t('injections.firstInjectionMonth', {
                  defaultValue: 'First Injection Month',
                })}
                content={injections?.vaccineCycleDetail.firstInjectionMonth}
              />
              <TextRenderHorizontal
                title={t('injections.numberPeriodic', {
                  defaultValue: 'Number Periodic',
                })}
                content={`${injections?.vaccineCycleDetail.numberPeriodic} (${
                  injections?.vaccineCycleDetail
                    ? t(injections?.vaccineCycleDetail?.unitPeriodic)
                    : 'N/A'
                })`}
              />
              <TextRenderHorizontal
                title={t('injections.vaccineIngredients', {
                  defaultValue: 'Vaccine Ingredients',
                })}
                content={injections?.vaccineCycleDetail.vaccineIngredients}
              />
              <TextRenderHorizontal
                title={t('injections.vaccineType', {
                  defaultValue: 'Vaccine Type',
                })}
                content={
                  injections?.vaccineCycleDetail.vaccineType
                    ? t(formatCamelCase(injections?.vaccineCycleDetail.vaccineType))
                    : 'N/A'
                }
              />
              <TextRenderHorizontal
                title={t('injections.injectionSite', {
                  defaultValue: 'Injection Site',
                })}
                content={
                  injections?.vaccineCycleDetail.injectionSite
                    ? t(formatCamelCase(injections?.vaccineCycleDetail.injectionSite))
                    : 'N/A'
                }
              />
            </View>
          </CardComponent>
          <CardComponent>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.titleCard}>
                {t('injections.vaccineItem', {
                  defaultValue: 'Vaccine Item',
                })}
              </Text>
              {roleName.toLowerCase() !== 'worker' && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#fff',
                    backgroundColor: COLORS.primary,
                    padding: 8,
                    borderRadius: 10,
                  }}
                  onPress={() => setModalVisible(true)}
                >
                  {t('injections.export', { defaultValue: 'Export' })}
                </Text>
              )}
            </View>
            <DividerUI />
            <View
              style={{
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  {injections?.vaccineCycleDetail.itemEntity.name}
                </Text>
                <TagUI
                  backgroundColor={getStatusItemDarkColor(
                    injections?.vaccineCycleDetail?.itemEntity?.status as StatusItem
                  )}
                >
                  {injections?.vaccineCycleDetail?.itemEntity
                    ? t(formatCamelCase(injections?.vaccineCycleDetail?.itemEntity?.status))
                    : 'N/A'}
                </TagUI>
              </View>
              <TextRenderHorizontal
                title={t('injections.category', { defaultValue: 'Category' })}
                content={injections?.vaccineCycleDetail.itemEntity.categoryEntity.name}
              />
              {/* <TextRenderHorizontal
                title={t('injections.quantity', { defaultValue: 'Quantity' })}
                content={`${injections?.vaccineCycleDetail.itemEntity.quantity} (${injections?.vaccineCycleDetail.itemEntity.unit})`}
              /> */}
              <TextRenderHorizontal
                title={t('injections.description', { defaultValue: 'Description' })}
                content={`${injections?.vaccineCycleDetail.itemEntity.description}`}
              />
            </View>
          </CardComponent>
        </View>
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
      </View>
    </ContainerComponent.ScrollView>
  );
};

const styles = StyleSheet.create({
  containerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleCard: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primary,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detail: {
    padding: 10,
    flexDirection: 'column',
    gap: 15,
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

export default InjectionScreen;
