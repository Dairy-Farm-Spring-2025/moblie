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
  Alert,
} from 'react-native';
import { useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import FloatingButton from '@components/FloatingButton/FloatingButton';

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

  const handleMilkBatchPress = (milkBatchId: number) => {
    (navigation.navigate as any)('MilkBatchDetail', { milkBatchId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderDailyMilk = useCallback(
    ({ item }: { item: DailyMilk }) => (
      <View style={styles.dailyMilkCard}>
        <Text style={styles.dailyMilkText}>Shift: {item.shift}</Text>
        <Text style={styles.dailyMilkText}>
          Milk Date: {format(new Date(item.milkDate), 'dd/MM/yyyy')}
        </Text>
        <Text style={styles.dailyMilkText}>Volume: {item.volume} liters</Text>
        <Text style={styles.dailyMilkText}>Worker: {item.worker.name}</Text>
        <Text style={styles.dailyMilkText}>Cow: {item.cow.name}</Text>
      </View>
    ),
    []
  );

  const renderMilkBatchItem = useCallback(
    ({ item }: { item: MilkBatch }) => (
      <View style={styles.milkBatchCard}>
        <TouchableOpacity onPress={() => handleMilkBatchPress(item.milkBatchId)}>
          <Text style={styles.milkBatchTitle}>Milk Batch ID: {item.milkBatchId}</Text>
          <Text>Total Volume: {item.totalVolume} liters</Text>
          <Text>Date: {format(new Date(item.date), 'dd/MM/yyyy')}</Text>
          <Text>Expiry Date: {format(new Date(item.expiryDate), 'dd/MM/yyyy')}</Text>
          <Text>Status: {item.status}</Text>
        </TouchableOpacity>

        {selectedMilkBatch?.milkBatchId === item.milkBatchId && (
          <>
            <Text style={styles.sectionTitle}>Daily Milks:</Text>
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

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size='large' color='#4CAF50' />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data: {error?.message}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name='refresh' size={20} color='white' /> {/* Replaced faSync with refresh */}
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : Array.isArray(milkBatchData) && milkBatchData.length > 0 ? (
        <FlatList
          data={milkBatchData}
          renderItem={renderMilkBatchItem}
          keyExtractor={(milkBatch) => milkBatch.milkBatchId.toString()}
        />
      ) : (
        <View style={styles.noMilkBatchesContainer}>
          <Text>No milk batches found</Text>
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
});

export default MilkBatchManagementScreen;
