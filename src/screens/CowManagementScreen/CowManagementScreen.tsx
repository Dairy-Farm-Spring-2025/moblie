import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the search icon
import { SegmentedButtons, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query'; // Import React Query hook
import { useNavigation } from '@react-navigation/native';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import FloatingButton from '@components/FloatingButton/FloatingButton';

// Fetch cows data from API
const fetchCows = async (): Promise<Cow[]> => {
  const response = await apiClient.get('/cows'); // Replace with your endpoint
  return response.data;
};

const CowManagementScreen: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'name' | 'status' | 'type'>('name');
  const [activeFilter, setActiveFilter] = useState<'name' | 'status' | 'type' | null>(null);

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
      <SegmentedButtons
        style={{ margin: 10 }}
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
        <TouchableOpacity onPress={() => setIsFilterVisible(true)} style={styles.filterButton}>
          <Ionicons name='filter' size={24} color='black' />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSearchText('')} style={styles.searchButton}>
          <Ionicons name='search' size={24} color='black' />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder='Search by name'
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Modal */}
      <Modal visible={isFilterVisible} animationType='slide' transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Select Filter</Text>
            <Button
              title='Filter by Name'
              onPress={() => {
                setSelectedFilter('name');
                setActiveFilter('name');
                setIsFilterVisible(false);
              }}
              color={activeFilter === 'name' ? 'blue' : 'gray'}
            />
            <Button
              title='Filter by Status'
              onPress={() => {
                setSelectedFilter('status');
                setActiveFilter('status');
                setIsFilterVisible(false);
              }}
              color={activeFilter === 'status' ? 'blue' : 'gray'}
            />
            <Button
              title='Filter by Type'
              onPress={() => {
                setSelectedFilter('type');
                setActiveFilter('type');
                setIsFilterVisible(false);
              }}
              color={activeFilter === 'type' ? 'blue' : 'gray'}
            />
            <Button title='Close' onPress={() => setIsFilterVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Loading or Error State */}
      {isLoading ? (
        <Text>Loading cows...</Text>
      ) : isError ? (
        <Text style={{ color: 'red' }}>{(error as Error).message}</Text>
      ) : (
        selectedSegment === 'list' && (
          <FlatList
            data={filteredCows}
            keyExtractor={(item) => item.cowId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigateToCowDetails(item.cowId)}
              >
                <Image source={{ uri: 'https://picsum.photos/200/300' }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Tooltip enterTouchDelay={200} title='Cow Type'>
                    <Text style={styles.cardType}>{item.cowType.name}</Text>
                  </Tooltip>
                  <Tooltip title='Origin - Date Of Birth'>
                    <View
                      style={{
                        backgroundColor: '#333',
                        padding: 4,
                        borderRadius: 4,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white' }}>{item.cowOrigin}-</Text>
                      <Text style={{ color: 'white' }}>{item.dateOfBirth}</Text>
                    </View>
                  </Tooltip>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      )}
      <FloatingButton onPress={() => (navigation.navigate as any)('CreateCowScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 10, marginBottom: 120 },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  cardContent: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 5,
    paddingLeft: 10,
    flex: 1,
  },
  searchButton: {
    padding: 10,
  },
  filterButton: {
    padding: 10,
  },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardType: { backgroundColor: 'green', padding: 4, borderRadius: 5, color: 'white' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CowManagementScreen;
