import ContainerComponent from '@components/Container/ContainerComponent';
import apiClient from '@config/axios/axios';
import { ExportItem } from '@model/ExportItem/ExportItem';
import React, { useState } from 'react';
import { FlatList, Text, View, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import CardMyExportItem from './components/CardMyExportItem';
import { t } from 'i18next';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
import { RefreshControl } from 'react-native-gesture-handler';
import ButtonComponent from '@components/Button/ButtonComponent';

const fetchMyExportItem = async (): Promise<ExportItem[]> => {
  try {
    const response = await apiClient.get('/export_items/my');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || t(`export_item.${'An error occurred while fetching the data'}`)
    );
  }
};

const bulkExportItems = async (exportItemIds: number[]) => {
  try {
    console.log(exportItemIds);
    const response = await apiClient.post('/export_items/bulk-export', exportItemIds);
    console.log(response);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response.data.message ||
        t(`export_item.${'An error occurred while fetching the data'}`)
    );
  }
};

const MyExportItemScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const {
    data: myNotificationData,
    isLoading,
    refetch,
  } = useQuery<ExportItem[]>('export_items/my', fetchMyExportItem, {
    onSettled: () => setRefreshing(false),
  });

  const { mutate: bulkExport } = useMutation(bulkExportItems, {
    onSuccess: () => {
      queryClient.invalidateQueries('export_items/my');
      setSelectedItems(new Set());
      Alert.alert(t('Success'), t(`export_item.${'Items exported successfully'}`));
    },
    onError: (error: any) => {
      Alert.alert(t('Error'), error.message || t(`export_item.${'Failed to bulk export items'}`));
    },
  });

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
  };

  // Toggle selection of an item
  const toggleSelection = (id: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  };

  // Select all non-exported items
  const selectAll = () => {
    const selectableItems =
      myNotificationData
        ?.filter((item) => item.status !== 'exported')
        .map((item) => item.exportItemId) || [];
    setSelectedItems(new Set(selectableItems));
  };

  // Handle bulk export
  const handleBulkExport = () => {
    if (selectedItems.size === 0) {
      Alert.alert(t('Warning'), t('Please select at least one item to export'));
      return;
    }
    bulkExport(Array.from(selectedItems));
  };

  // Sort data by createdAt (newest first)
  const sortedData = myNotificationData
    ? [...myNotificationData].sort(
        (a, b) => new Date(b.exportDate).getTime() - new Date(a.exportDate).getTime()
      )
    : [];

  const hasNonExportedItems =
    myNotificationData?.some((item) => item.status !== 'exported') || false;

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <ContainerComponent>
      {sortedData.length > 0 ? (
        <>
          <FlatList
            data={sortedData}
            style={{
              padding: 10,
            }}
            renderItem={({ item }) => (
              <CardMyExportItem
                item={item}
                isSelected={selectedItems.has(item.exportItemId)}
                onToggleSelection={() =>
                  item.status !== 'exported' && toggleSelection(item.exportItemId)
                }
                isExportable={item.status !== 'exported'}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor='#007AFF'
              />
            }
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
            {hasNonExportedItems && (
              <ButtonComponent onPress={selectAll} type='secondary'>
                {t('export_item.select_all', { defaultValue: 'Select All' })}
              </ButtonComponent>
            )}
            {selectedItems.size > 0 && (
              <ButtonComponent onPress={handleBulkExport} type='primary'>
                {t('export_item.bulk_export', { defaultValue: 'Bulk Export' })} (
                {selectedItems.size})
              </ButtonComponent>
            )}
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{t('nodata')}</Text>
        </View>
      )}
    </ContainerComponent>
  );
};

export default MyExportItemScreen;
