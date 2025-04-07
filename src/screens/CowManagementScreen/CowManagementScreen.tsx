import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import SearchInput from '@components/Input/Search/SearchInput';
import CardCow from '@components/CardCow/CardCow';
import { useTranslation } from 'react-i18next';

// Fetch cows data from API
const fetchCows = async (): Promise<Cow[]> => {
  const response = await apiClient.get('/cows');
  return response.data;
};

const CowManagementScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSegment, setSelectedSegment] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'name' | 'origin' | 'type' | 'pen' | 'area'>(
    'name'
  );
  const [displayedCows, setDisplayedCows] = useState<Cow[]>([]);
  const [dataProvider, setDataProvider] = useState(new DataProvider((r1, r2) => r1 !== r2));
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const itemsPerPage = 20;

  const { data: cows, isLoading, isError, error, refetch } = useQuery<Cow[]>('cows', fetchCows);
  const navigation = useNavigation();

  // Filter cows based on selected filter and search text
  const filteredCows = React.useMemo(() => {
    return (
      cows?.filter((cow) => {
        if (selectedFilter === 'name') {
          return cow.name?.toLowerCase().includes(searchText.toLowerCase());
        } else if (selectedFilter === 'origin') {
          return cow.cowOrigin?.toLowerCase().includes(searchText.toLowerCase());
        } else if (selectedFilter === 'type') {
          return cow.cowType?.name.toLowerCase().includes(searchText.toLowerCase());
        } else if (selectedFilter === 'pen') {
          return cow.penResponse?.name.toLowerCase().includes(searchText.toLowerCase());
        } else if (selectedFilter === 'area') {
          return cow.penResponse?.area.name.toLowerCase().includes(searchText.toLowerCase());
        }
        return false;
      }) || []
    );
  }, [cows, searchText, selectedFilter]);

  // Define LayoutProvider
  const layoutProvider = new LayoutProvider(
    () => 0,
    (type, dim) => {
      dim.width = Dimensions.get('window').width - 20;
      dim.height = 200; // Adjust based on your CardCow height
    }
  );

  // Update displayed cows and dataProvider when filteredCows changes
  useEffect(() => {
    const initialCows = filteredCows.slice(0, itemsPerPage);
    setDisplayedCows(initialCows);
    setDataProvider((prev) => prev.cloneWithRows(initialCows));
    setPage(1);
  }, [filteredCows]);

  // Load more cows when scrolling
  const loadMoreCows = () => {
    if (loadingMore || displayedCows.length >= filteredCows.length) return;

    setLoadingMore(true);
    const nextCows = filteredCows.slice(0, page * itemsPerPage + itemsPerPage);
    setDisplayedCows(nextCows);
    setDataProvider((prev) => prev.cloneWithRows(nextCows));
    setPage(page + 1);
    setLoadingMore(false);
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Refetch data from API using React Query
    setRefreshing(false);
  }, [refetch]);

  // Detect pull-to-refresh based on scroll position
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY <= -50 && !refreshing) {
      onRefresh(); // Trigger refresh when pulled down sufficiently
    }
  };

  // Render each cow item
  const rowRenderer = (type: string | number, data: Cow) => (
    <CardCow cow={data} onPress={() => navigateToCowDetails(data.cowId)} />
  );

  const navigateToCowDetails = (cowId: number) => {
    (navigation.navigate as any)('CowDetails', { cowId });
  };

  return (
    <View style={styles.container}>
      {/* Segmented Buttons */}
      {/* <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'list', label: t('cow_management.cows'), icon: 'cow' },
          { value: 'create', label: t('cow_management.create'), icon: 'plus' },
          { value: 'health', label: t('cow_management.health'), icon: 'heart' },
          { value: 'report', label: t('cow_management.report'), icon: 'chart-bar' },
        ]}
      /> */}

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <SearchInput
          filteredData={filteredCows as Cow[]}
          onChangeText={setSearchText}
          value={searchText}
          typeFiltered={{
            filteredType: ['name', 'origin', 'type', 'pen', 'area'],
            setSelectedFiltered: setSelectedFilter,
          }}
        />
      </View>

      {/* Cow List with RecyclerListView */}
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        selectedSegment === 'list' && (
          <View style={{ flex: 1 }}>
            {displayedCows.length > 0 ? (
              <>
                {refreshing && <ActivityIndicator size='large' style={styles.refreshIndicator} />}
                <RecyclerListView
                  layoutProvider={layoutProvider}
                  dataProvider={dataProvider}
                  rowRenderer={rowRenderer}
                  onEndReached={loadMoreCows}
                  onEndReachedThreshold={100}
                  onScroll={handleScroll} // Detect pull-to-refresh
                  scrollViewProps={{ scrollEventThrottle: 16 }} // Throttle scroll events
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  renderFooter={() => (loadingMore ? <ActivityIndicator size='large' /> : null)}
                />
              </>
            ) : (
              <Text>No cows found</Text>
            )}
          </View>
        )
      )}

      {/* Floating Action Button */}
      {/* <FloatingButton onPress={() => (navigation.navigate as any)('CreateCowScreen')} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedButtons: {
    margin: 10,
  },
  searchFilterContainer: {
    marginBottom: 10,
    padding: 10,
  },
  refreshIndicator: {
    marginVertical: 10,
  },
});

export default CowManagementScreen;
