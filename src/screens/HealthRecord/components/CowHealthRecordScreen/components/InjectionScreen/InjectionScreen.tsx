import CardComponent from '@components/Card/CardComponent';
import ContainerComponent from '@components/Container/ContainerComponent';
import apiClient from '@config/axios/axios';
import { InjectionCow, InjectionStatus } from '@model/Cow/Cow';
import { RouteProp, useRoute } from '@react-navigation/native';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Title } from 'react-native-paper';
import { useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import TagUI from '@components/UI/TagUI';
import { t } from 'i18next';
import DividerUI from '@components/UI/DividerUI';
import { COLORS } from '@common/GlobalStyle';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import { getStatusItemDarkColor } from '@utils/getColorsStatus';
import { StatusItem } from '@model/Item/Item';

type RootStackParamList = {
  InjectionScreen: { vaccineInjectionId: number };
};

type InjectionScreenRouteProp = RouteProp<
  RootStackParamList,
  'InjectionScreen'
>;

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

const InjectionScreen = () => {
  const route = useRoute<InjectionScreenRouteProp>();
  const { vaccineInjectionId } = route.params;
  const {
    data: injections,
    isLoading,
    isError,
    error,
  } = useQuery(['vaccine-injections', vaccineInjectionId], () =>
    fetchVaccineInjections(vaccineInjectionId)
  );
  const getStatusDarkColor = (status: InjectionStatus) =>
    statusColors[status] || '#374151'; // Default Dark Gray
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
        <View style={styles.containerTitle}>
          <Text style={styles.title}>
            {injections?.injectionDate
              ? convertToDDMMYYYY(injections?.injectionDate)
              : 'N/A'}
          </Text>
          <TagUI
            backgroundColor={getStatusDarkColor(
              injections?.status as InjectionStatus
            )}
          >
            {injections?.status
              ? t(formatCamelCase(injections?.status))
              : 'N/A'}
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
                    ? t(
                        formatCamelCase(
                          injections?.vaccineCycleDetail.vaccineType
                        )
                      )
                    : 'N/A'
                }
              />
              <TextRenderHorizontal
                title={t('injections.injectionSite', {
                  defaultValue: 'Injection Site',
                })}
                content={
                  injections?.vaccineCycleDetail.injectionSite
                    ? t(
                        formatCamelCase(
                          injections?.vaccineCycleDetail.injectionSite
                        )
                      )
                    : 'N/A'
                }
              />
            </View>
          </CardComponent>
          <CardComponent>
            <Text style={styles.titleCard}>
              {t('injections.vaccineItem', {
                defaultValue: 'Vaccine Item',
              })}
            </Text>
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
                    injections?.vaccineCycleDetail?.itemEntity
                      ?.status as StatusItem
                  )}
                >
                  {injections?.vaccineCycleDetail?.itemEntity
                    ? t(
                        formatCamelCase(
                          injections?.vaccineCycleDetail?.itemEntity?.status
                        )
                      )
                    : 'N/A'}
                </TagUI>
              </View>
              <TextRenderHorizontal
                title={t('injections.category', { defaultValue: 'Category' })}
                content={
                  injections?.vaccineCycleDetail.itemEntity.categoryEntity.name
                }
              />
              <TextRenderHorizontal
                title={t('injections.quantity', { defaultValue: 'Quantity' })}
                content={`${injections?.vaccineCycleDetail.itemEntity.quantity} (${injections?.vaccineCycleDetail.itemEntity.unit})`}
              />
            </View>
          </CardComponent>
        </View>
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
});

export default InjectionScreen;
