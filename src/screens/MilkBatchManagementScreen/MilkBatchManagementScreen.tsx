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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { t } from 'i18next';
import apiClient from '@config/axios/axios';
import { DailyMilk } from '@model/Milk/DailyMilk/DailyMilk';
import { MilkBatch } from '@model/Milk/MilkBatch/MilkBatch';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
import { formatCamelCase } from '@utils/format';

const fetchMilkBatch = async (): Promise<MilkBatch[]> => {
  try {
    const response = await apiClient.get('/MilkBatch');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || 'An error occurred while fetching the data'
    );
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
  } = useQuery<MilkBatch[]>('milkBatch', fetchMilkBatch, {
    refetchOnMount: true,
    refetchOnWindowFocus: true, // 👈 Thêm dòng này
  });

  const [selectedMilkBatch, setSelectedMilkBatch] = useState<MilkBatch | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] =
    useState<MilkBatch | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleMilkBatchPress = (milkBatchId: number) => {
    (navigation.navigate as any)('MilkBatchDetail', { milkBatchId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const toggleMilkBatchDetails = (milkBatch: MilkBatch) => {
    setSelectedMilkBatch(
      selectedMilkBatch?.milkBatchId === milkBatch.milkBatchId
        ? null
        : milkBatch
    );
  };

  const renderDailyMilk = useCallback(
    ({ item }: { item: DailyMilk }) => (
      <View style={styles.dailyMilkCard}>
        <View style={styles.dailyMilkRow}>
          <Ionicons name="time-outline" size={16} color="#4CAF50" />
          <Text style={styles.dailyMilkText}>
            {t('shift')}: {t(formatCamelCase(item.shift))}
          </Text>
        </View>
        <View style={styles.dailyMilkRow}>
          <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
          <Text style={styles.dailyMilkText}>
            {t('milk_date')}: {format(new Date(item.milkDate), 'dd/MM/yyyy')}
          </Text>
        </View>
        <View style={styles.dailyMilkRow}>
          <Ionicons name="water-outline" size={16} color="#4CAF50" />
          <Text style={styles.dailyMilkText}>
            {t('volume')}: {item.volume} {t('liters')}
          </Text>
        </View>
        <View style={styles.dailyMilkRow}>
          <Ionicons name="person-outline" size={16} color="#4CAF50" />
          <Text style={styles.dailyMilkText}>
            {t('worker')}: {item.worker.name}
          </Text>
        </View>
        <View style={styles.dailyMilkRow}>
          <Ionicons name="paw-outline" size={16} color="#4CAF50" />
          <Text style={styles.dailyMilkText}>
            {t('cow')}: {item.cow.name}
          </Text>
        </View>
      </View>
    ),
    []
  );

  const renderMilkBatchItem = useCallback(
    ({ item }: { item: MilkBatch }) => (
      <View style={styles.milkBatchCard}>
        <TouchableOpacity
          style={styles.milkBatchHeader}
          onPress={() => toggleMilkBatchDetails(item)}
        >
          <View style={styles.milkBatchHeaderContent}>
            <Text style={styles.milkBatchTitle}>
              {t('milk_batch_id')}: {format(new Date(item.date), 'dd/MM/yyyy')}
            </Text>
            <Text style={styles.milkBatchSubtitle}>
              {t('total_volume')}: {item.totalVolume} {t('liters')}
            </Text>
            <Text style={styles.milkBatchSubtitle}>
              {t('expiry_date')}:{' '}
              {format(new Date(item.expiryDate), 'dd/MM/yyyy')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'inventory' ? '#4CAF50' : '#E53935',
                },
              ]}
            >
              <Text style={styles.statusText}>
                {t(formatCamelCase(item.status))}
              </Text>
            </View>
          </View>
          <Ionicons
            name={
              selectedMilkBatch?.milkBatchId === item.milkBatchId
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>
        {selectedMilkBatch?.milkBatchId === item.milkBatchId && (
          <View style={styles.dailyMilkContainer}>
            <Text style={styles.sectionTitle}>{t('daily_milks')}</Text>
            <FlatList
              data={item.dailyMilks}
              renderItem={renderDailyMilk}
              keyExtractor={(dailyMilk) => dailyMilk.dailyMilkId.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleMilkBatchPress(item.milkBatchId)}
        >
          <Text style={styles.detailsButtonText}>{t('view_details')}</Text>
        </TouchableOpacity>
      </View>
    ),
    [selectedMilkBatch, renderDailyMilk]
  );

  // Calculate metrics for the cards
  const totalLiters =
    milkBatchData?.reduce((sum, batch) => sum + batch.totalVolume, 0) || 0;
  const numberOfBatches = milkBatchData?.length || 0;
  const averageVolumePerBatch =
    numberOfBatches > 0 ? (totalLiters / numberOfBatches).toFixed(2) : 0;

  // Prepare data for the line chart
  const sortedMilkBatches = milkBatchData
    ? [...milkBatchData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : [];
  const chartData = sortedMilkBatches.map((batch) => ({
    value: batch.totalVolume,
    label: format(new Date(batch.date), 'dd/MM'),
    dataPointText: `${batch.totalVolume}L`,
    customData: batch,
  }));

  // Handle data point click
  const handleDataPointClick = (item: any) => {
    const batch = item.customData as MilkBatch;
    setSelectedBatchDetails(batch);
    setModalVisible(true);
  };

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('milk_batch_management.title')}
        </Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      {isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('error_loading_data')}: {(error as any)?.message}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshButtonText}>{t('refresh')}</Text>
          </TouchableOpacity>
        </View>
      ) : Array.isArray(milkBatchData) && milkBatchData.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Metric Cards */}
          <View style={styles.cardsContainer}>
            <View style={styles.metricCard}>
              <Ionicons name="water-outline" size={28} color="#4CAF50" />
              <Text style={styles.cardTitle}>{t('total_liters')}</Text>
              <Text style={styles.cardValue}>{totalLiters} L</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="stats-chart-outline" size={28} color="#4CAF50" />
              <Text style={styles.cardTitle}>{t('avg_volume_batch')}</Text>
              <Text style={styles.cardValue}>{averageVolumePerBatch} L</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="cube-outline" size={28} color="#4CAF50" />
              <Text style={styles.cardTitle}>{t('total_batches')}</Text>
              <Text style={styles.cardValue}>{numberOfBatches}</Text>
            </View>
          </View>

          {/* Line Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('milk_volume_trend')}</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={200}
              isAnimated={true}
              color="#4CAF50"
              thickness={3}
              yAxisTextStyle={styles.chartText}
              xAxisLabelTextStyle={styles.chartText}
              showDataPoints
              dataPointsColor="#4CAF50"
              dataPointsRadius={6}
              textColor="#333"
              textFontSize={12}
              onDataPointClick={handleDataPointClick}
            />
          </View>

          {/* Milk Batch List */}
          <ScrollView>
            <FlatList
              data={milkBatchData.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )}
              renderItem={renderMilkBatchItem}
              keyExtractor={(milkBatch) => milkBatch.milkBatchId.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.batchList}
            />
          </ScrollView>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>{t('no_milk_batches_found')}</Text>
        </View>
      )}

      {/* Modal for Batch Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('Milk Batch Details')}</Text>
            {selectedBatchDetails && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('Milk Batch ID')}:</Text>
                  <Text style={styles.modalValue}>
                    {selectedBatchDetails.milkBatchId}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('Total Volume')}:</Text>
                  <Text style={styles.modalValue}>
                    {selectedBatchDetails.totalVolume} {t('liters')}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('date')}:</Text>
                  <Text style={styles.modalValue}>
                    {format(new Date(selectedBatchDetails.date), 'dd/MM/yyyy')}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('Expiry Date')}:</Text>
                  <Text style={styles.modalValue}>
                    {format(
                      new Date(selectedBatchDetails.expiryDate),
                      'dd/MM/yyyy'
                    )}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('status')}:</Text>
                  <Text style={styles.modalValue}>
                    {selectedBatchDetails.status}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingButton
        onPress={() =>
          (navigation.navigate as any)('QrCodeScanCow', {
            screens: 'DetailFormMilk',
          })
        }
        style={styles.floatingButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    width: (Dimensions.get('window').width - 48) / 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  chartText: {
    fontSize: 12,
    color: '#4A5568',
  },
  batchList: {
    paddingBottom: 80, // Space for floating button
  },
  milkBatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  milkBatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  milkBatchHeaderContent: {
    flex: 1,
  },
  milkBatchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  milkBatchSubtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dailyMilkContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  dailyMilkCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  dailyMilkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dailyMilkText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#4A5568',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    textAlign: 'right',
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  floatingButton: {
    bottom: 32,
    right: 16,
  },
});

export default MilkBatchManagementScreen;
