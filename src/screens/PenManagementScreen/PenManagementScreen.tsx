import SearchInput from '@components/Input/Search/SearchInput';
import DividerUI from '@components/UI/DividerUI';
import TagUI from '@components/UI/TagUI';
import TextTitle from '@components/UI/TextTitle';
import apiClient from '@config/axios/axios';
import { Pen } from '@model/Pen/Pen';
import { useNavigation } from '@react-navigation/native';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
import { formatFilteredType, formatType } from '@utils/format';
import { t } from 'i18next';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { Text, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query';
const fetchPens = async (): Promise<Pen[]> => {
  const response = await apiClient.get('/pens'); // Replace with your endpoint
  return response.data;
};

const PenManagementScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const navigation = useNavigation();
  const {
    data: pens,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Pen[]>('pens', fetchPens, {
    onSettled: () => setRefreshing(false),
  });

  const filteredPen = pens?.filter((pen) => {
    if (selectedFilter === 'name') {
      return pen.name?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'type') {
      const humanReadableType = formatFilteredType(pen.penType);
      return humanReadableType?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'status') {
      const humanReadableType = formatFilteredType(pen.penStatus);
      return humanReadableType?.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'area') {
      return pen.area?.name?.toLowerCase().includes(searchText.toLowerCase());
    }
    return false;
  });

  const handleNavigationToDetail = (penId: number) => {
    (navigation.navigate as any)('PenDetailScreen', { penId });
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
  };

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
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
      {isError ? (
        <View>
          <Text>{error as any}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPen}
          keyExtractor={(item: Pen) => item.penId.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor='#007AFF'
            />
          }
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => handleNavigationToDetail(item.penId)}
              >
                <View>
                  <View style={styles.cardTitle}>
                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Tooltip enterTouchDelay={200} title='Area'>
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
                      <Tooltip title='Pen Status'>
                        <TagUI backgroundColor='orange' fontSize={10}>
                          {formatType(t(`data.${item.penStatus}`))}
                        </TagUI>
                      </Tooltip>
                    </View>
                    <TextTitle
                      title={t('Dimension')}
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
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: '100%',
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
