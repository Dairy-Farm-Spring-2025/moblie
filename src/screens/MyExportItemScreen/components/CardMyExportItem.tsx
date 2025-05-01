import ButtonComponent from '@components/Button/ButtonComponent';
import CardComponent from '@components/Card/CardComponent';
import DividerUI from '@components/UI/DividerUI';
import TagUI from '@components/UI/TagUI';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import apiClient from '@config/axios/axios';
import { ExportItem, ExportItemStatus } from '@model/ExportItem/ExportItem';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import { t } from 'i18next';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useMutation, useQueryClient } from 'react-query';

interface CardMyExportItemProps {
  item: ExportItem;
}

function getStatusColor(status: ExportItemStatus): string {
  const colors: Record<ExportItemStatus, string> = {
    pending: '#FF8C00', // Dark Orange
    approved: '#006400', // Dark Green
    exported: '#003366', // Dark Blue
    cancel: '#4B4B4B', // Dark Gray
    reject: '#8B0000', // Dark Red
  };

  return colors[status] || '#000000'; // Default to black if status is unknown
}

const CardMyExportItem = ({ item }: CardMyExportItemProps) => {
  const queryClient = useQueryClient();

  const { mutate: mutateExportItem } = useMutation(
    async ({ id }: { id: number }) => await apiClient.put(`export_items/export/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('export_items/my');
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  const { mutate: mutateCancelItem } = useMutation(
    async ({ id }: { id: number }) => await apiClient.put(`export_items/cancel/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('export_items/my');
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  return (
    <CardComponent style={{ marginVertical: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          alignItems: 'center',
        }}
      >
        <Text style={styles.title}>
          {item?.exportDate ? convertToDDMMYYYY(item?.exportDate) : 'N/A'}
        </Text>
        <TagUI backgroundColor={getStatusColor(item.status)}>
          {t(formatCamelCase(item.status))}
        </TagUI>
      </View>
      <DividerUI />
      <TextRenderHorizontal
        title={t('export_item.item', { defaultValue: 'Item' })}
        content={
          item?.itemBatchEntity?.itemEntity ? item?.itemBatchEntity?.itemEntity?.name : 'N/A'
        }
      />
      <TextRenderHorizontal
        title={t('export_item.quantity', { defaultValue: 'Quantity' })}
        content={`${item?.quantity} (${item?.itemBatchEntity?.itemEntity.unit})`}
      />
      <TextRenderHorizontal
        title={t('export_item.importDate', { defaultValue: 'Import Date' })}
        content={
          item?.itemBatchEntity.importDate
            ? convertToDDMMYYYY(item?.itemBatchEntity?.importDate)
            : 'N/A'
        }
      />
      <TextRenderHorizontal
        title={t('export_item.expiredDate', { defaultValue: 'Expired Date' })}
        content={
          item?.itemBatchEntity.expiryDate
            ? convertToDDMMYYYY(item?.itemBatchEntity?.expiryDate)
            : 'N/A'
        }
      />
      <TextRenderHorizontal
        title={t('export_item.task', { defaultValue: 'Task' })}
        content={formatCamelCase(item.task.taskTypeId.name)}
      />
      <DividerUI />
      {item.status === 'pending' && (
        <View style={styles.buttonLayout}>
          <ButtonComponent
            onPress={() => mutateCancelItem({ id: item.exportItemId })}
            width={'30%'}
            type='danger'
          >
            {t('export_item.cancel', { defaultValue: 'Cancel' })}
          </ButtonComponent>
          <ButtonComponent
            onPress={() => mutateExportItem({ id: item.exportItemId })}
            type='primary'
            width={'30%'}
          >
            {t('export_item.export', { defaultValue: 'Export' })}
          </ButtonComponent>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: '500',
    fontSize: 13,
  },
  buttonLayout: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
});

export default CardMyExportItem;
