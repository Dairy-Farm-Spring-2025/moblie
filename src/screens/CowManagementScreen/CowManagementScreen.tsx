import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { SegmentedButtons, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query'; // Import React Query hook
import { useNavigation } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import SearchInput from '@components/Input/Search/SearchInput'; // Custom SearchInput component
import CardCow from '@components/CardCow/CardCow';

// Fetch cows data from API
const fetchCows = async (): Promise<Cow[]> => {
  const response = await apiClient.get('/cows'); // Replace with your endpoint
  return response.data;
};

const CowManagementScreen: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'name' | 'status' | 'type'>('name');

  // Use React Query's useQuery hook to fetch cows data
  const { data: cows, isLoading, isError, error } = useQuery<Cow[]>('cows', fetchCows);

  const navigation = useNavigation();

  // Filter cows based on selected filter and search text
  const filteredCows = cows?.filter((cow) => {
    if (selectedFilter === 'name') {
      return cow.name?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'status') {
      return cow.cowStatus?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'type') {
      return cow.cowType?.name.toLowerCase().includes(searchText.toLowerCase());
    }
    return false;
  });

  const navigateToCowDetails = (cowId: number) => {
    (navigation.navigate as any)('CowDetails', { cowId });
  };

  return (
    <View style={styles.container}>
      {/* Segmented Buttons */}
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'list', label: 'Cows', icon: 'cow' },
          { value: 'create', label: 'Create', icon: 'plus' },
          { value: 'health', label: 'Health', icon: 'heart' },
          { value: 'report', label: 'Report', icon: 'chart-bar' },
        ]}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <SearchInput
          filteredData={filteredCows as Cow[]}
          onChangeText={setSearchText}
          value={searchText}
          typeFiltered={{
            filteredType: ['name', 'status', 'type'],
            setSelectedFiltered: setSelectedFilter,
          }}
        />
      </View>

      {/* Cow List */}
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        selectedSegment === 'list' && (
          <FlatList
            numColumns={2}
            data={filteredCows}
            keyExtractor={(item) => item.cowId.toString()}
            renderItem={({ item }) => (
              <CardCow cow={item} onPress={() => navigateToCowDetails(item.cowId)} />
            )}
          />
        )
      )}

      {/* Floating Action Button */}
      <FloatingButton onPress={() => (navigation.navigate as any)('CreateCowScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
  },
  segmentedButtons: {
    margin: 10,
  },
  searchFilterContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  card: {
    margin: 10,
    width: '45%', // For 2-column grid layout
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardType: {
    backgroundColor: 'green',
    padding: 4,
    borderRadius: 5,
    color: 'white',
    fontSize: 10,
  },
  cardContent: {
    flexDirection: 'column',
    marginTop: 10,
  },
  cardDetails: {
    fontSize: 12,
    color: 'gray',
  },
});

export default CowManagementScreen;
