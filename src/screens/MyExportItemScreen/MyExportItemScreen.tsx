import ContainerComponent from '@components/Container/ContainerComponent';
import apiClient from '@config/axios/axios';
import { ExportItem } from '@model/ExportItem/ExportItem';
import React from 'react';
import { FlatList, Text, View } from 'react-native'; // Added Text import
import { useQuery } from 'react-query';
import CardMyExportItem from './components/CardMyExportItem';
import { ActivityIndicator } from 'react-native-paper';
import { t } from 'i18next'; // Import t from i18next
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';

const fetchMyExportItem = async (): Promise<ExportItem[]> => {
  try {
    const response = await apiClient.get('/export_items/my');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const MyExportItemScreen = () => {
  const { data: myNotificationData, isLoading } = useQuery<ExportItem[]>(
    'export_items/my',
    fetchMyExportItem
  );
  console.log('myNotificationData', myNotificationData);

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <ContainerComponent>
      {myNotificationData!.length > 0 ? (
        <FlatList
          data={myNotificationData}
          style={{
            padding: 10,
          }}
          renderItem={({ item }) => <CardMyExportItem item={item} />}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{t('nodata')}</Text>
        </View>
      )}
    </ContainerComponent>
  );
};

export default MyExportItemScreen;
