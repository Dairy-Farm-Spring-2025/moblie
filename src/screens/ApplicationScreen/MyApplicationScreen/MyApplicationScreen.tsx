import ContainerComponent from '@components/Container/ContainerComponent';
import EmptyUI from '@components/UI/EmptyUI';
import apiClient from '@config/axios/axios';
import { Application } from '@model/Application/Application';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import CardApplication from './components/CardApplication';
import { t } from 'i18next';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';

const fetchMyRequestApplication = async (): Promise<Application[]> => {
  const response = await apiClient.get(`/application/my-request`);
  return response.data;
};

const MyApplicationScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery('application/my-request', () => fetchMyRequestApplication(), {
    onSettled: () => setRefreshing(false),
  });

  const { mutate } = useMutation(
    async ({ id, data }: { id: number; data: any }) =>
      await apiClient.put(`application/cancel-request/${id}`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message);
        queryClient.invalidateQueries('application/my-request');
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );
  const onCancel = async (id: number) => {
    const payload = {
      approvalStatus: 'cancel',
      commentApprove: '',
    };
    mutate({ id, data: payload });
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
  };

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <ContainerComponent>
      {isError ? (
        <Text
          style={{
            color: 'red',
          }}
        >
          {(error as any).message}
        </Text>
      ) : application?.length === 0 ? (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text>{t('nodata')}</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 10,
            padding: 10,
          }}
          keyExtractor={(item: Application) => item.applicationId.toString()}
          data={application}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor='#007AFF'
            />
          }
          renderItem={({ item }) => (
            <CardApplication
              items={item}
              onCancelApplication={() => onCancel(item.applicationId)}
            />
          )}
        />
      )}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
  },
});

export default MyApplicationScreen;
