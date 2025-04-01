import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SegmentedButtons, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query'; // Import React Query hook
import { useNavigation } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import SearchInput from '@components/Input/Search/SearchInput'; // Custom SearchInput component
import CardCow from '@components/CardCow/CardCow';
import { useTranslation } from 'react-i18next';

// Fetch cows data from API
const fetchCows = async (): Promise<Cow[]> => {
  const response = await apiClient.get('/cows'); // Replace with your endpoint
  return response.data;
};

const CowManagementScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSegment, setSelectedSegment] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'name' | 'origin' | 'type' | 'pen' | 'area'
  >('name');

  // Use React Query's useQuery hook to fetch cows data
  const {
    data: cows,
    isLoading,
    isError,
    error,
  } = useQuery<Cow[]>('cows', fetchCows);

  const navigation = useNavigation();

  // Filter cows based on selected filter and search text
  const filteredCows = cows?.filter((cow) => {
    if (selectedFilter === 'name') {
      return cow.name?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'origin') {
      return cow.cowOrigin?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'type') {
      return cow.cowType?.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'pen') {
      return cow.penResponse?.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (selectedFilter === 'area') {
      return cow.penResponse?.area.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
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
          { value: 'list', label: t('cow_management.cows'), icon: 'cow' },
          { value: 'create', label: t('cow_management.create'), icon: 'plus' },
          { value: 'health', label: t('cow_management.health'), icon: 'heart' },
          {
            value: 'report',
            label: t('cow_management.report'),
            icon: 'chart-bar',
          },
        ]}
      />

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

      {/* Cow List */}
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        selectedSegment === 'list' && (
          <FlatList
            data={filteredCows}
            keyExtractor={(item) => item.cowId.toString()}
            contentContainerStyle={{
              paddingHorizontal: 10,
            }}
            renderItem={({ item }) => (
              <CardCow
                cow={item}
                onPress={() => navigateToCowDetails(item.cowId)}
              />
            )}
          />
        )
      )}

      {/* Floating Action Button */}
      <FloatingButton
        onPress={() => (navigation.navigate as any)('CreateCowScreen')}
      />
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
  },
});

export default CowManagementScreen;
