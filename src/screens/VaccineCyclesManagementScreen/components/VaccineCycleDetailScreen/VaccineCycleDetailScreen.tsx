import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { VaccineCycle } from '@model/Cow/Cow';
import { t } from 'i18next';
import Timeline from 'react-native-timeline-flatlist';
import RenderHTML from 'react-native-render-html';
import { RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  VaccineCycleDetail: { cycle: VaccineCycle };
};

type VaccineCycleDetailScreenRouteProp = RouteProp<RootStackParamList, 'VaccineCycleDetail'>;

const VaccineCycleDetailScreen = () => {
  const route = useRoute<VaccineCycleDetailScreenRouteProp>();
  const { cycle } = route.params;

  const getVaccineTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hormone':
        return '#ff6b6b';
      case 'antibiotic':
        return '#4ecdc4';
      case 'vaccine':
        return '#45b7d1';
      default:
        return '#cccccc';
    }
  };

  const timelineData = cycle.vaccineCycleDetails.map((detail) => ({
    time: detail.firstInjectionMonth || 'N/A',
    title: detail.name || t('injections.vaccineCycleDetail'),
    description: `
      <div>
        <p>${t('injections.dosage', { defaultValue: 'Dosage' })}: ${detail.dosage || 0} ${
      detail.dosageUnit || 'N/A'
    }</p>
        <p>${t('injections.injectionSite', { defaultValue: 'Injection Site' })}: ${
      detail.injectionSite || 'N/A'
    }</p>
        <p>${t('injections.numberPeriodic', { defaultValue: 'Number Periodic' })}: ${
      detail.numberPeriodic || 0
    } ${detail.unitPeriodic || 'N/A'}</p>
        <p>${t('injections.vaccineItem', { defaultValue: 'Vaccine Item' })}: ${
      detail.itemEntity?.name || 'N/A'
    }</p>
      </div>
    `,
    lineColor: getVaccineTypeColor(detail.vaccineType),
    circleColor: getVaccineTypeColor(detail.vaccineType),
    vaccineType: detail.vaccineType,
  }));

  const renderDetail = (rowData: any) => {
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{rowData.title}</Text>
          <View
            style={[
              styles.vaccineTypeBadge,
              { backgroundColor: getVaccineTypeColor(rowData.vaccineType) },
            ]}
          >
            <Text style={styles.vaccineTypeText}>{rowData.vaccineType || t('Vaccine')}</Text>
          </View>
        </View>
        <RenderHTML
          contentWidth={Dimensions.get('window').width - 80}
          source={{ html: rowData.description }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>{cycle.name || t('vaccine_cycle.title')}</Text>
        <Text style={styles.cardSubtitle}>
          {t('card_cow.cow_type')}: {cycle.cowTypeEntity?.name || t('card_cow.unnamed')}
        </Text>
        <RenderHTML
          contentWidth={Dimensions.get('window').width - 40}
          source={{ html: cycle.description }}
        />
      </View>
      <Timeline
        style={styles.timeline}
        data={timelineData}
        circleSize={16}
        circleColor='rgba(0,0,0,0)'
        lineWidth={2}
        timeStyle={styles.time}
        descriptionStyle={styles.description}
        renderDetail={renderDetail}
        innerCircle={'dot'}
        separator={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timeline: {
    flex: 1,
  },
  detailContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  detailHeader: {
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  vaccineTypeBadge: {
    width: 60,
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  vaccineTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeContainer: {
    minWidth: 50,
    marginRight: 10,
  },
  time: {
    textAlign: 'center',
    backgroundColor: '#007bff',
    color: 'white',
    padding: 5,
    borderRadius: 13,
    fontSize: 12,
  },
  description: {
    color: '#555',
    fontSize: 14,
  },
});

export default VaccineCycleDetailScreen;
