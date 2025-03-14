import ContainerComponent from '@components/Container/ContainerComponent';
import SearchInput from '@components/Input/Search/SearchInput';
import apiClient from '@config/axios/axios';
import { FeedMeals } from '@model/Feed/Feed';
import { formatFilteredType } from '@utils/format';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import CardFeed from './components/CardFeed/CardFeed';
const fetchFeed = async (): Promise<FeedMeals[]> => {
  const response = await apiClient.get('/feedmeals'); // Replace with your endpoint
  return response.data;
};
const FeedManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const {
    data: feed,
    isLoading,
    isError,
    error,
  } = useQuery<FeedMeals[]>('feedmeals', fetchFeed);
  const filteredFeed = feed?.filter((feed) => {
    if (selectedFilter === 'name') {
      return feed?.name.toLowerCase().includes(searchText.toLowerCase());
    }
  });
  useEffect(() => {
    if (isError) {
      Alert.alert('Error', (error as Error)?.message);
    }
  }, []);

  return isLoading ? (
    <ActivityIndicator />
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
        renderItem={({ item }) => <CardFeed item={item} />}
      />
    </ContainerComponent>
  );
};

export default FeedManagementScreen;
