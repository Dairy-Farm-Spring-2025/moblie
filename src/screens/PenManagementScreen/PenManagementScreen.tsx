import SearchInput from '@components/Input/Search/SearchInput';
import DividerUI from '@components/UI/DividerUI';
import TagUI from '@components/UI/TagUI';
import TextTitle from '@components/UI/TextTitle';
import apiClient from '@config/axios/axios';
import { Pen } from '@model/Pen/Pen';
import { formatFilteredType, formatType } from '@utils/format';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query';
const fetchPens = async (): Promise<Pen[]> => {
  const response = await apiClient.get('/pens'); // Replace with your endpoint
  return response.data;
};
const PenManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');

  const {
    data: pens,
    isLoading,
    isError,
    error,
  } = useQuery<Pen[]>('pens', fetchPens);

  const filteredPen = pens?.filter((pen) => {
    if (selectedFilter === 'name') {
      return pen.name?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'type') {
      const humanReadableType = formatFilteredType(pen.penType);
      return humanReadableType
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (selectedFilter === 'status') {
      const humanReadableType = formatFilteredType(pen.penStatus);
      return humanReadableType
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (selectedFilter === 'area') {
      return pen.area?.name?.toLowerCase().includes(searchText.toLowerCase());
    }
    return false;
  });

  return (
    <View style={styles.container}>
      <SearchInput
        filteredData={filteredPen as Pen[]}
        onChangeText={setSearchText}
        value={searchText}
        typeFiltered={{
          filteredType: ['name', 'status', 'type', 'area'],
          setSelectedFiltered: setSelectedFilter,
        }}
      />
      {isLoading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : isError ? (
        <View>
          <Text>{error as any}</Text>
        </View>
      ) : (
        <FlatList
          numColumns={2}
          contentContainerStyle={{
            paddingBottom: 10,
            gap: 5,
          }}
          data={filteredPen}
          keyExtractor={(item: Pen) => item.penId.toString()}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity style={styles.card}>
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpK3Y1ipYNGi4zHyfKLSMX0586IhS2E5xAog&s',
                  }}
                  style={styles.cardImage}
                />
                <View>
                  <View style={styles.cardTitle}>
                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Tooltip enterTouchDelay={200} title="Area">
                      <TagUI>{item.area.name}</TagUI>
                    </Tooltip>
                  </View>
                  <DividerUI />
                  <View
                    style={{
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <View style={styles.cardContent}>
                      <Tooltip title="Pen Type">
                        <TagUI backgroundColor="blue" fontSize={10}>
                          {formatType(item.penType)}
                        </TagUI>
                      </Tooltip>
                      <Tooltip title="Pen Status">
                        <TagUI backgroundColor="orange" fontSize={10}>
                          {formatType(item.penStatus)}
                        </TagUI>
                      </Tooltip>
                    </View>
                    <TextTitle
                      title="Dimension"
                      content={`${item.area.penWidth}m x ${item.area.penLength}m`}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 10, marginBottom: 120, height: '100%' },
  card: {
    flex: 1,
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
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
});

export default PenManagementScreen;
