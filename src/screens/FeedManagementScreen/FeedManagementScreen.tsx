import React, { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigation } from '@react-navigation/native';

import ContainerComponent from '@components/Container/ContainerComponent';
import SearchInput from '@components/Input/Search/SearchInput';
import apiClient from '@config/axios/axios';
import { FeedMeals } from '@model/Feed/Feed';
import CardFeed from './components/CardFeed/CardFeed';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import { t } from 'i18next';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';

const fetchFeed = async (): Promise<FeedMeals[]> => {
  const response = await apiClient.get('/feedmeals');
  return response.data;
};

const FeedManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {
    data: feed,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FeedMeals[]>('feedmeals', fetchFeed);

  const filteredFeed = feed?.filter(
    (feed) =>
      selectedFilter === 'name' && feed?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const navigateToFoodDetail = (feedId: number) => {
    (navigation.navigate as any)('FeedDetailScreen', { feedId });
  };

  useEffect(() => {
    if (isError) {
      Alert.alert(t('Error'), (error as Error)?.message);
    }
  }, [isError, error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries('feedmeals'); // Làm mới dữ liệu
    setRefreshing(false);
  }, [queryClient]);

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <ContainerComponent>
      <SearchInput
        filteredData={filteredFeed as FeedMeals[]}
        onChangeText={setSearchText}
        value={searchText}
        typeFiltered={{
          filteredType: ['name'],
          setSelectedFiltered: setSelectedFilter,
        }}
      />
      <FlatList
        contentContainerStyle={{
          paddingBottom: 10,
          paddingHorizontal: 10,
        }}
        data={filteredFeed}
        keyExtractor={(item: FeedMeals) => item.feedMealId.toString()}
        renderItem={({ item }) => (
          <CardFeed item={item} navigation={() => navigateToFoodDetail(item.feedMealId)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </ContainerComponent>
  );
};

export default FeedManagementScreen;
