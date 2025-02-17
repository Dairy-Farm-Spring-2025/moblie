import SearchInput from '@components/Input/Search/SearchInput';
import DividerUI from '@components/UI/DividerUI';
import TextTitle from '@components/UI/TextTitle';
import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { useNavigation } from '@react-navigation/native';
import { formatFilteredType, formatType } from '@utils/format';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query';
const fetchAreas = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas'); // Replace with your endpoint
  return response.data;
};
const AreaManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const navigation = useNavigation();
  const {
    data: area,
    isLoading,
    isError,
    error,
  } = useQuery<Area[]>('areas', fetchAreas);

  const navigateToAreaDetail = (areaId: number) => {
    (navigation.navigate as any)('AreaDetail', { areaId });
  };

  const filteredArea = area?.filter((area) => {
    if (selectedFilter === 'name') {
      return area?.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'type') {
      const humanReadable = formatFilteredType(area?.areaType);
      return humanReadable?.toLowerCase().includes(searchText.toLowerCase());
    }
  });

  return (
    <View style={styles.container}>
      <SearchInput
        filteredData={filteredArea as Area[]}
        onChangeText={setSearchText}
        value={searchText}
        typeFiltered={{
          filteredType: ['name', 'type'],
          setSelectedFiltered: setSelectedFilter,
        }}
      />
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        <FlatList
          numColumns={2}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
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
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
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
                      {formatType(item.areaType)}
                    </Text>
                  </Tooltip>
                </View>
                <DividerUI />
                <View style={styles.cardContent}>
                  <TextTitle
                    content={`${item.width}m x ${item.length}m`}
                    title="Dimension"
                  />
                  <TextTitle
                    content={`${item.penWidth}m x ${item.penLength}m`}
                    title="Pen Dimension"
                  />
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
    fontSize: 10,
  },
  card: {
    margin: 10,
    width: '45%', // For 2-column grid layout
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
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
  cardContent: {
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    flexDirection: 'column',
    gap: 3,
  },
  title: {
    fontWeight: 'bold',
  },
  cardWrapper: {
    width: '100%',
  },
});

export default AreaManagementScreen;
