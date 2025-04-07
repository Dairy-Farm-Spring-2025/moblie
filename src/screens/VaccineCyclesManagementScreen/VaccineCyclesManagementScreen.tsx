import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import SearchInput from '@components/Input/Search/SearchInput';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import { VaccineCycle } from '@model/Cow/Cow';
import { t } from 'i18next';

const fetchVaccineCycles = async () => {
  const response = await apiClient.get('/vaccinecycles');
  return response.data;
};

const VaccineCycleCard: React.FC<{ cycle: VaccineCycle; onPress: () => void }> = ({
  cycle,
  onPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVaccineTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hormone':
        return '#ff6b6b'; // Red
      case 'antibiotic':
        return '#4ecdc4'; // Teal
      case 'vaccine':
        return '#45b7d1'; // Blue
      default:
        return '#cccccc'; // Grey
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => setIsExpanded(!isExpanded)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{cycle.name || t('vaccine_cycle.title')}</Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color='#007bff' />
      </View>
      <Text style={styles.cardSubtitle}>
        {t('card_cow.cow_type')}: {cycle.cowTypeEntity?.name || t('card_cow.unnamed')}
      </Text>
      <Text style={styles.cardDescription}>{cycle.description || t('cowDetails.description')}</Text>

      {isExpanded && (
        <View style={styles.detailsContainer}>
          {cycle.vaccineCycleDetails.map((detail) => (
            <View key={detail.vaccineCycleDetailId} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>
                  {detail.name || t('injections.vaccineCycleDetail')}
                </Text>
                <View
                  style={[
                    styles.vaccineTypeBadge,
                    { backgroundColor: getVaccineTypeColor(detail.vaccineType) },
                  ]}
                >
                  <Text style={styles.vaccineTypeText}>{detail.vaccineType || t('Vaccine')}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Fontisto name='injection-syringe' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('injections.dosage')}: {detail.dosage || 0} {detail.dosageUnit || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='location' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('injections.injectionSite')}: {detail.injectionSite || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='calendar' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('injections.firstInjectionMonth')}: {detail.firstInjectionMonth || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='time' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('injections.numberPeriodic')}: {detail.numberPeriodic || 0}{' '}
                  {detail.unitPeriodic || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='cube' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('injections.vaccineItem')}: {detail.itemEntity?.name || 'N/A'} (
                  {detail.itemEntity?.quantity || 0} {detail.itemEntity?.unit || 'N/A'})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='pricetag' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('feed.category')}: {detail.itemEntity?.categoryEntity?.name || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='home' size={20} color='#007bff' />
                <Text style={styles.detailText}>
                  {t('feed.storage')}: {detail.itemEntity?.warehouseLocationEntity?.name || 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
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
            <VaccineCycleCard key={cycle.vaccineCycleId} cycle={cycle} onPress={() => {}} />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
  },
  detailsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
  },
  vaccineTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  vaccineTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
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
