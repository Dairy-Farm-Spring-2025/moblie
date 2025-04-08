import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import SearchInput from '@components/Input/Search/SearchInput';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import { VaccineCycle } from '@model/Cow/Cow';
import { t } from 'i18next';
import VaccineCycleCard from './components/VaccineCycleCard/VaccineCycleCard';

const fetchVaccineCycles = async () => {
  const response = await apiClient.get('/vaccinecycles');
  return response.data;
};

const VaccineCyclesManagementScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'name' | 'description' | 'cowType'>('name');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: vaccineCycles,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VaccineCycle[], Error>('vaccineCycles', fetchVaccineCycles, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const filteredCycles =
    vaccineCycles?.filter((cycle) => {
      switch (selectedFilter) {
        case 'name':
          return cycle.name?.toLowerCase().includes(searchText.toLowerCase()) ?? false;
        case 'description':
          return cycle.description?.toLowerCase().includes(searchText.toLowerCase()) ?? false;
        case 'cowType':
          return (
            cycle.cowTypeEntity?.name?.toLowerCase().includes(searchText.toLowerCase()) ?? false
          );
        default:
          return false;
      }
    }) || [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message={t('vaccine_cycle.title')} fullScreen={true} color='#007bff' />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t('error')}: {(error as Error)?.message || t('error')}
        </Text>
      </View>
    );
  }

  const filterTranslations = {
    name: t('cowDetails.name'),
    description: t('cowDetails.description'),
    cowType: t('card_cow.cow_type'),
  };

  return (
    <View style={styles.container}>
      <SearchInput
        value={searchText}
        onChangeText={setSearchText}
        filteredData={filteredCycles}
        typeFiltered={{
          filteredType: ['name', 'description', 'cowType'],
          setSelectedFiltered: setSelectedFilter,
        }}
        placeholder={`${t('vaccine_cycle.title')} ${filterTranslations[selectedFilter]}...`}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
            tintColor='#007bff'
          />
        }
      >
        {filteredCycles.length > 0 ? (
          filteredCycles.map((cycle) => (
            <VaccineCycleCard key={cycle.vaccineCycleId} cycle={cycle} />
          ))
        ) : (
          <Text style={styles.noDataText}>{t('vaccine_cycle.title')}</Text>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VaccineCyclesManagementScreen;
