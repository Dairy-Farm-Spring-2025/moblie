import ContainerComponent from '@components/Container/ContainerComponent';
import SearchInput from '@components/Input/Search/SearchInput';
import DividerUI from '@components/UI/DividerUI';
import TextTitle from '@components/UI/TextTitle';
import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { useNavigation } from '@react-navigation/native';
import { formatFilteredType, formatType } from '@utils/format';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import { Text, Tooltip } from 'react-native-paper';
import { useQuery } from 'react-query';
import { getIconByAreaType } from '@utils/icon/areaIcon';
import { t } from 'i18next';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
const fetchAreas = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas'); // Replace with your endpoint
  return response.data;
};
const AreaManagementScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const navigation = useNavigation();
  const { data: area, isLoading, isError, error } = useQuery<Area[]>('areas', fetchAreas);

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

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <ContainerComponent>
      <SearchInput
        filteredData={filteredArea as Area[]}
        onChangeText={setSearchText}
        value={searchText}
        typeFiltered={{
          filteredType: ['name', 'type'],
          setSelectedFiltered: setSelectedFilter,
        }}
      />
      {isError ? (
        <Text>{(error as Error).message}</Text>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          data={filteredArea}
          keyExtractor={(item: Area) => item.areaId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigateToAreaDetail(item.areaId)}>
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
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={getIconByAreaType(item?.areaType)?.name as any}
                      color={getIconByAreaType(item?.areaType)?.color}
                      size={20}
                    />
                    <Tooltip enterTouchDelay={200} title={t('Cow Type')}>
                      <Text style={styles.areaType}>{formatType(t(`data.${item.areaType}`))}</Text>
                    </Tooltip>
                  </View>
                </View>
                <DividerUI />
                <View style={styles.cardContent}>
                  <TextTitle content={`${item.width}m x ${item.length}m`} title={t('Dimension')} />
                  <TextTitle
                    content={`${item.penWidth}m x ${item.penLength}m`}
                    title={t('Pen Dimension')}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  areaType: {
    backgroundColor: 'green',
    padding: 4,
    borderRadius: 5,
    color: 'white',
    fontSize: 10,
  },
  card: {
    margin: 10,
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
