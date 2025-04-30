import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { MilkBatch } from '@model/Milk/MilkBatch/MilkBatch';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from 'i18next';
import { formatCamelCase } from '@utils/format';
import useRoleColor from '@utils/hooks/hooks';

type RootStackParamList = {
  DetailMilkBatch: { milkBatchId: number };
  MilkBatchManagementScreen: { defaultIndex?: number };
};

type DetailMilkBatchRouteProp = RouteProp<RootStackParamList, 'DetailMilkBatch'>;
type DetailMilkBatchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DetailMilkBatch'
>;

const fetchDetailMilkBatch = async (milkBatchId: number): Promise<MilkBatch> => {
  const response = await apiClient.get(`/MilkBatch/${milkBatchId}`);
  return response.data;
};

const DetailMilkBatch: React.FC = () => {
  const route = useRoute<DetailMilkBatchRouteProp>();
  const navigation = useNavigation<DetailMilkBatchNavigationProp>();
  const roleColor = useRoleColor();
  const { milkBatchId } = route.params;

  const {
    data: milkBatch,
    isLoading,
    isError,
  } = useQuery(['milkBatch', milkBatchId], () => fetchDetailMilkBatch(milkBatchId));

  if (isLoading) {
    return <Text style={styles.loadingText}>{t('detailMilkBatch.loading')}</Text>;
  }

  if (isError || !milkBatch) {
    return <Text style={styles.errorText}>{t('detailMilkBatch.error')}</Text>;
  }

  // Prepare data for the pie chart (no names in legend)
  const pieChartData = milkBatch.dailyMilks.map((dailyMilk, index) => ({
    name: `L - ${new Date(dailyMilk.milkDate).toLocaleDateString('vi-VN')}`, // Empty name to hide legend
    volume: dailyMilk.volume,
    color: index % 2 === 0 ? '#4c758c' : '#00a5fc', // Alternating shades of green
    legendFontColor: '#333',
    legendFontSize: 14,
    cowName: `${t('detailMilkBatch.cow.name')} ${dailyMilk.cow.name}`, // Store name for display below
  }));

  // Get up to two cow names for display below the chart
  const displayedCowNames = pieChartData.slice(0, 2).map((item) => {
    return { name: item.cowName, color: item.color };
  });

  return (
    <ScrollView style={styles.container}>
      {/* Milk Batch Information */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {t('detailMilkBatch.title', {
            milkBatchId: new Date(milkBatch.date).toLocaleDateString('vi-VN'),
          })}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name='water-outline' size={20} color={roleColor} />
          <Text style={styles.text}>
            <Text style={styles.bold}>{t('detailMilkBatch.totalVolume')}</Text>{' '}
            {milkBatch.totalVolume}L
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name='calendar-outline' size={20} color={roleColor} />
          <Text style={styles.text}>
            <Text style={styles.bold}>{t('detailMilkBatch.date')}</Text>{' '}
            {new Date(milkBatch.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name='calendar-outline' size={20} color={roleColor} />
          <Text style={styles.text}>
            <Text style={styles.bold}>{t('detailMilkBatch.expiryDate')}</Text>{' '}
            {new Date(milkBatch.expiryDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name='ellipse'
            size={20}
            color={milkBatch.status === 'inventory' ? roleColor : '#E53935'}
          />
          <Text style={[styles.text]}>
            <Text style={styles.bold}>{t('detailMilkBatch.status')}</Text>{' '}
            {t(`statuses.${milkBatch.status}`)}
          </Text>
        </View>
      </View>

      {/* Pie Chart for Daily Milk Contributions */}
      {milkBatch.dailyMilks.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('detailMilkBatch.chartTitle')}</Text>
          <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#e0e0e0',
              backgroundGradientFrom: '#f5f5f5',
              backgroundGradientTo: '#f5f5f5',
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            }}
            accessor='volume'
            backgroundColor='transparent'
            paddingLeft='15'
            absolute
          />
          {/* Display up to two cow names below the chart */}
          <View style={styles.cowNamesContainer}>
            {displayedCowNames.map((name, index) => (
              <View key={index} style={styles.cowNameRow}>
                <Ionicons name='paw-outline' size={22} color={name.color} />
                <Text style={[styles.cowNameText, { color: name.color }]}>{name.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Daily Milks */}
      {milkBatch.dailyMilks.map((dailyMilk) => (
        <View style={styles.card} key={dailyMilk.dailyMilkId}>
          <Text style={styles.sectionTitle}>
            {t('detailMilkBatch.dailyMilk.title', { dailyMilkId: dailyMilk.dailyMilkId })}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name='time-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.dailyMilk.shift')}</Text>{' '}
              {t(`shifts.${dailyMilk.shift}`)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.dailyMilk.milkDate')}</Text>{' '}
              {new Date(dailyMilk.milkDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='water-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.dailyMilk.volume')}</Text>{' '}
              {dailyMilk.volume}L
            </Text>
          </View>

          {/* Cow Information */}
          <Text style={styles.sectionTitle}>{t('detailMilkBatch.cow.title')}</Text>
          <View style={styles.infoRow}>
            <Ionicons name='paw-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.cow.name')}</Text> {dailyMilk.cow.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='ellipse' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.cow.status')}</Text>{' '}
              {t(`cowStatuses.${dailyMilk.cow.cowStatus}`)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.cow.dateOfBirth')}</Text>{' '}
              {new Date(dailyMilk.cow.dateOfBirth).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.cow.dateOfEnter')}</Text>{' '}
              {new Date(dailyMilk.cow.dateOfEnter).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='globe-outline' size={20} color={roleColor} />
            <Text style={styles.text}>
              <Text style={styles.bold}>{t('detailMilkBatch.cow.origin')}</Text>{' '}
              {formatCamelCase(dailyMilk.cow.cowOrigin)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cowNamesContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
    width: Dimensions.get('window').width - 40,
  },
  cowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cowNameText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 50,
  },
});

export default DetailMilkBatch;
