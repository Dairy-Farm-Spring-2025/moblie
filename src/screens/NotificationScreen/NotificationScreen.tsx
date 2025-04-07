import ContainerComponent from '@components/Container/ContainerComponent';
import Layout from '@components/layout/Layout';
import apiClient from '@config/axios/axios';
import { Notification } from '@model/Notification/Notification';
import React from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import CardNotification from './components/CardNotification';
import { t } from 'i18next';

const fetchNotification = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/notifications/myNotification');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const NotificationScreen = () => {
  const { data: myNotificationData, isLoading } = useQuery<Notification[]>(
    'notifications/myNotification',
    fetchNotification
  );
  return (
    <Layout isScrollable={false}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <ContainerComponent>
          {myNotificationData!.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingVertical: 10,
                paddingHorizontal: 5,
              }}
              data={myNotificationData}
              keyExtractor={(item: Notification) => item.id.notificationId.toString()}
              renderItem={({ item }) => <CardNotification item={item as Notification} />}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                }}
              >
                {t('notification.noNotifications')}
              </Text>
            </View>
          )}
        </ContainerComponent>
      )}
    </Layout>
  );
};

export default NotificationScreen;
