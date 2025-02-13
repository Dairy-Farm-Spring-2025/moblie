import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; // For the search icon
import {
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, Text, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import { formatAreaType } from '@utils/format';
const fetchCows = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas'); // Replace with your endpoint
  return response.data;
};
const AreaManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  const {
    data: area,
    isLoading,
    isError,
    error,
  } = useQuery<Area[]>('areas', fetchCows);

  const navigateToAreaDetail = (areaId: number) => {
    (navigation.navigate as any)('AreaDetail', { areaId });
  };

  const filteredArea = area?.filter((area) => {
    return area?.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchFilterContainer}>
        <TouchableOpacity
          onPress={() => setSearchText('')}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {searchText !== '' && (
        <View style={styles.searchFilterContainer}>
          <Text style={{ color: 'blue' }}>
            {filteredArea?.length}{' '}
            {(filteredArea?.length as number) > 1 ? 'results' : 'result'} found
          </Text>
        </View>
      )}
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        <FlatList
          data={filteredArea}
          keyExtractor={(item: Area) => item.areaId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigateToAreaDetail(item.areaId)}
            >
              <Image
                source={{
                  uri: 'https://cdn.britannica.com/62/60562-050-2A18D89A/much-Russia-parts-climate-zone-Europe-Midwest.jpg',
                }}
                style={styles.cardImage}
              />
              <View style={styles.cardWrapper}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Tooltip enterTouchDelay={200} title="Cow Type">
                    <Text style={styles.areaType}>
                      {formatAreaType(item.areaType)}
                    </Text>
                  </Tooltip>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.cardContent}>
                  <View style={styles.content}>
                    <Text style={styles.title}>Dimension:</Text>
                    <Text>
                      {item.width}m x {item.length}m
                    </Text>
                  </View>
                  <View style={styles.content}>
                    <Text style={styles.title}>Pen Dimension:</Text>
                    <Text>
                      {item.penWidth}m x {item.penLength}m
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 10, marginBottom: 120, height: '100%' },
  areaType: {
    backgroundColor: 'green',
    padding: 4,
    borderRadius: 5,
    color: 'white',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 7,
  },
  content: {
    flexDirection: 'column',
    gap: 3,
  },
  title: {
    fontWeight: 'bold',
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
  cardWrapper: {
    width: '100%',
  },
});

export default AreaManagementScreen;
