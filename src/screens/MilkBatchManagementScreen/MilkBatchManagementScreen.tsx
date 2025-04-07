import apiClient from '@config/axios/axios';
import { DailyMilk } from '@model/Milk/DailyMilk/DailyMilk';
import { MilkBatch } from '@model/Milk/MilkBatch/MilkBatch';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import { LineChart } from 'react-native-gifted-charts';
import { t } from 'i18next';

const fetchMilkBatch = async (): Promise<MilkBatch[]> => {
  try {
    const response = await apiClient.get('/MilkBatch');
    return response.data;
  } catch (error) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};
const MilkBatchManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    data: milkBatchData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MilkBatch[]>('milkBatch', fetchMilkBatch);

  const [selectedMilkBatch, setSelectedMilkBatch] = useState<MilkBatch | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<MilkBatch | null>(null);

  const handleMilkBatchPress = (milkBatchId: number) => {
    (navigation.navigate as any)('MilkBatchDetail', { milkBatchId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const toggleMilkBatchDetails = (milkBatch: MilkBatch) => {
    setSelectedMilkBatch(
      selectedMilkBatch?.milkBatchId === milkBatch.milkBatchId ? null : milkBatch
    );
  };

  const renderDailyMilk = useCallback(
    ({ item }: { item: DailyMilk }) => (
      <View style={styles.dailyMilkCard}>
        <Text style={styles.dailyMilkText}>
          {t('Shift')}: {item.shift}
        </Text>
        <Text style={styles.dailyMilkText}>
          {t('Milk Date')}: {format(new Date(item.milkDate), 'dd/MM/yyyy')}
        </Text>
        <Text style={styles.dailyMilkText}>
          {t('Volume')}: {item.volume} {t('liters')}
        </Text>
        <Text style={styles.dailyMilkText}>
          {t('Worker')}: {item.worker.name}
        </Text>
        <Text style={styles.dailyMilkText}>
          {t('Cow')}: {item.cow.name}
        </Text>
      </View>
    ),
    []
  );

  const renderMilkBatchItem = useCallback(
    ({ item }: { item: MilkBatch }) => (
      <View style={styles.milkBatchCard}>
        <TouchableOpacity onPress={() => toggleMilkBatchDetails(item)}>
          <Text style={styles.milkBatchTitle}>
            {t('Milk Batch ID')}: {item.milkBatchId}
          </Text>
          <Text>
            {t('Total Volume')}: {item.totalVolume} {t('liters')}
          </Text>
          <Text>
            {t('Date')}: {format(new Date(item.date), 'dd/MM/yyyy')}
          </Text>
          <Text>
            {t('Expiry Date')}: {format(new Date(item.expiryDate), 'dd/MM/yyyy')}
          </Text>
          <Text>
            {t('Status')}: {item.status}
          </Text>
        </TouchableOpacity>

        {selectedMilkBatch?.milkBatchId === item.milkBatchId && (
          <>
            <Text style={styles.sectionTitle}>{t('Daily Milks')}:</Text>
            <FlatList
              data={item.dailyMilks}
              renderItem={renderDailyMilk}
              keyExtractor={(dailyMilk) => dailyMilk.dailyMilkId.toString()}
            />
          </>
        )}
      </View>
    ),
    [selectedMilkBatch, renderDailyMilk]
  );

  // Calculate metrics for the cards
  const totalLiters = milkBatchData?.reduce((sum, batch) => sum + batch.totalVolume, 0) || 0;
  const numberOfBatches = milkBatchData?.length || 0;
  const averageVolumePerBatch =
    numberOfBatches > 0 ? (totalLiters / numberOfBatches).toFixed(2) : 0;

  // Prepare data for the line chart with additional metadata
  const sortedMilkBatches = milkBatchData
    ? [...milkBatchData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  const chartData = sortedMilkBatches.map((batch) => ({
    value: batch.totalVolume,
    label: format(new Date(batch.date), 'dd/MM'),
    dataPointText: `${batch.totalVolume}L`, // Optional: Display text on the data point
    customData: batch, // Store the full batch object for use in onDataPointClick
  }));

  // Handle data point click
  const handleDataPointClick = (item: any, index: number) => {
    const batch = item.customData as MilkBatch;
    console.log('Data point clicked:', batch);
    setSelectedBatchDetails(batch);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size='large' color='#4CAF50' />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data: {error?.message}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name='refresh' size={20} color='white' />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : Array.isArray(milkBatchData) && milkBatchData.length > 0 ? (
        <ScrollView>
          {/* Three Cards for Key Metrics */}
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Ionicons name='water-outline' size={30} color='#4CAF50' />
              <Text style={styles.cardTitle}>Total Liters</Text>
              <Text style={styles.cardValue}>{totalLiters} L</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name='stats-chart-outline' size={30} color='#4CAF50' />
              <Text style={styles.cardTitle}>{t('Avg. Volume/Batch')}</Text>
              <Text style={styles.cardValue}>{averageVolumePerBatch} L</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name='cube-outline' size={30} color='#4CAF50' />
              <Text style={styles.cardTitle}>{t('Total Batches')}</Text>
              <Text style={styles.cardValue}>{numberOfBatches}</Text>
            </View>
          </View>

          {/* Line Chart for Milk Volume Trend */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('Milk Volume Trend')} (liters)</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              isAnimated={true}
              color='#4CAF50'
              thickness={2}
              yAxisTextStyle={{ color: '#333' }}
              enablePanGesture={false}
              onDataPointClick={() => {
                console.log('masoud');
              }} // Handle data point click
              showDataPoints // Show data points on the chart
              dataPointsColor='#4CAF50' // Color of the data points
              dataPointsRadius={6} // Size of the data points
            />
          </View>

          {/* Modal for Milk Batch Details */}
          <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('Milk Batch Details')}</Text>
                {selectedBatchDetails && (
                  <>
                    <Text style={styles.modalText}>
                      <Text style={styles.bold}>{t('Milk Batch ID')}:</Text>{' '}
                      {selectedBatchDetails.milkBatchId}
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={styles.bold}>{t('Total Volume')}:</Text>{' '}
                      {selectedBatchDetails.totalVolume} {t('liters')}
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={styles.bold}>{t('Date')}:</Text>{' '}
                      {format(new Date(selectedBatchDetails.date), 'dd/MM/yyyy')}
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={styles.bold}>{t('Expiry Date')}:</Text>{' '}
                      {format(new Date(selectedBatchDetails.expiryDate), 'dd/MM/yyyy')}
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={styles.bold}>{t('Status')}:</Text> {selectedBatchDetails.status}
                    </Text>
                  </>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>{t('Close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* List of Milk Batches */}
          <FlatList
            data={milkBatchData}
            renderItem={renderMilkBatchItem}
            keyExtractor={(milkBatch) => milkBatch.milkBatchId.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : (
        <View style={styles.noMilkBatchesContainer}>
          <Text>{t('No milk batches found')}</Text>
        </View>
      )}
      <FloatingButton
        onPress={() => (navigation.navigate as any)('QrCodeScanCow', { screens: 'DetailFormMilk' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  noMilkBatchesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
    width: (Dimensions.get('window').width - 60) / 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
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
  milkBatchCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  milkBatchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3E5C6D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },
  dailyMilkCard: {
    backgroundColor: '#fafafa',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  dailyMilkText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MilkBatchManagementScreen;
