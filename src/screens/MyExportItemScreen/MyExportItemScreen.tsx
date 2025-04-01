import ContainerComponent from '@components/Container/ContainerComponent';
import apiClient from '@config/axios/axios';
import { ExportItem } from '@model/ExportItem/ExportItem';
import React from 'react';
import { FlatList } from 'react-native';
import { useQuery } from 'react-query';
import CardMyExportItem from './components/CardMyExportItem';
import { ActivityIndicator } from 'react-native-paper';

const fetchMyExportItem = async (): Promise<ExportItem[]> => {
  try {
    const response = await apiClient.get('/export_items/my');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || 'An error occurred while fetching the data'
    );
  }
};

const MyExportItemScreen = () => {
  const { data: myNotificationData, isLoading } = useQuery<ExportItem[]>(
    'export_items/my',
    fetchMyExportItem
  );
  console.log(myNotificationData);
  return (
    <ContainerComponent>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={myNotificationData}
          style={{
            padding: 10,
          }}
          renderItem={({ item }) => <CardMyExportItem item={item} />}
        />
      )}
    </ContainerComponent>
  );
};

export default MyExportItemScreen;
