import FloatingButton from '@components/FloatingButton/FloatingButton';
import SearchInput from '@components/Input/Search/SearchInput';
import DividerUI from '@components/UI/DividerUI';
import TagUI from '@components/UI/TagUI';
import apiClient from '@config/axios/axios';
import { HealthRecord } from '@model/HealthRecord/HealthRecord';
import { useNavigation } from '@react-navigation/native';
import { formatType } from '@utils/format';
import { t } from 'i18next';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';
import { useQuery } from 'react-query';
const fetchHealthRecord = async (): Promise<HealthRecord[]> => {
  try {
    const response = await apiClient.get('/health-record');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || 'An error occurred while fetching the data'
    );
  }
};
const HealthRecordScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('name');
  const navigation = useNavigation();
  const {
    data: healthRecordData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<HealthRecord[]>('/health-record', fetchHealthRecord);

  const filteredHealthRecord = healthRecordData?.filter((healthRecord) => {
    if (selectedFilter === 'name') {
      return healthRecord?.cowEntity?.name
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
    }
  });

  const sortedHealthRecord = filteredHealthRecord?.sort(
    (a, b) =>
      new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime()
  );

  const getStatusIcon = (
    status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering'
  ) => {
    switch (status) {
      case 'good':
        return 'check-circle-outline';
      case 'fair':
        return 'help-circle-outline';
      case 'poor':
        return 'alert-circle-outline';
      case 'critical':
        return 'skull';
      case 'recovering':
        return 'refresh';
      default:
        return 'circle';
    }
  };

  // Function to return status color based on status
  const getStatusColor = (
    status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering'
  ) => {
    switch (status) {
      case 'good':
        return 'green';
      case 'fair':
        return 'orange';
      case 'poor':
        return 'red';
      case 'critical':
        return 'darkred';
      case 'recovering':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleNavigate = (healthRecord: HealthRecord) => {
    (navigation.navigate as any)('HealthRecordFormScreen', {
      healthRecord: healthRecord,
      fromScreen: 'health',
    });
  };

  const renderHealthRecordItem = useCallback(
    ({ item }: { item: HealthRecord }) => (
      <Card onPress={() => handleNavigate(item)} style={styles.card}>
        <View style={styles.cardContent}>
          {/* Status Icon */}
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: 20,
            }}
          >
            <IconButton
              icon={getStatusIcon(item.status) as any}
              iconColor={getStatusColor(item.status) as any}
              size={40}
              style={styles.statusIcon}
            />
            <Text>{formatType(item.status)}</Text>
          </View>
          {/* Cow Name and Period */}
          <View style={styles.containerItemContent}>
            <View style={styles.infoContainer}>
              <Text variant="titleLarge" style={styles.cowName}>
                {item.cowEntity?.name}
              </Text>
              <TagUI>{formatType(item.period)}</TagUI>
            </View>
            <Text variant="bodySmall" style={styles.reportTime}>
              {new Date(item.reportTime).toLocaleString()}
            </Text>
          </View>
        </View>
        <DividerUI />
        <View
          style={{
            flexDirection: 'column',
            padding: 10,
            gap: 5,
          }}
        >
          <Text>
            ⚖️ {t('Weight')} {item.weight} kg
          </Text>
          <Text>
            📏 {t('Size')}: {item.size} cm
          </Text>
        </View>
      </Card>
    ),
    []
  );

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (isError) {
    return <Text>{(error as Error).message}</Text>;
  }

  return (
    <View style={styles.container}>
      <SearchInput
        filteredData={filteredHealthRecord as HealthRecord[]}
        onChangeText={setSearchText}
        value={searchText}
        typeFiltered={{
          filteredType: ['name'],
          setSelectedFiltered: setSelectedFilter,
        }}
      />
      <FlatList
        data={sortedHealthRecord}
        keyExtractor={(item: HealthRecord) => item.healthRecordId.toString()}
        renderItem={renderHealthRecordItem}
        onEndReached={() => refetch()}
        onEndReachedThreshold={0.5}
      />
      <FloatingButton
        onPress={() =>
          (navigation.navigate as any)('QrScanCow', {
            screens: 'CowHealthRecord',
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    height: 40,
    width: 40,
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cowName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  period: {
    color: '#666',
  },
  reportTime: {
    marginTop: 5,
    color: '#888',
  },
  containerItemContent: {
    flexDirection: 'column',
  },
});

export default HealthRecordScreen;
