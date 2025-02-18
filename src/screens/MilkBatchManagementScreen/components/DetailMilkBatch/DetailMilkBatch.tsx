import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { MilkBatch } from '@model/Milk/MilkBatch/MilkBatch';
import { formatCamelCase } from '@utils/format';

type RootStackParamList = {
  DetailMilkBatch: { milkBatchId: number };
};

type DetailMilkBatchRouteProp = RouteProp<RootStackParamList, 'DetailMilkBatch'>;

const fetchDetailMilkBatch = async (milkBatchId: number): Promise<MilkBatch> => {
  const response = await apiClient.get(`/MilkBatch/${milkBatchId}`);
  return response.data;
};

const DetailMilkBatch: React.FC = () => {
  const route = useRoute<DetailMilkBatchRouteProp>();
  const { milkBatchId } = route.params;

  const {
    data: milkBatch,
    isLoading,
    isError,
  } = useQuery(['milkBatch', milkBatchId], () => fetchDetailMilkBatch(milkBatchId));

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading milk batch details...</Text>;
  }

  if (isError || !milkBatch) {
    return <Text style={styles.errorText}>Failed to load milk batch details</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Milk Batch Information */}
      <View style={styles.card}>
        <Text style={styles.title}>Milk Batch #{milkBatch.milkBatchId}</Text>
        <Text style={styles.text}>
          🥛 <Text style={styles.bold}>Total Volume:</Text> {milkBatch.totalVolume}L
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Date:</Text> {new Date(milkBatch.date).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Expiry Date:</Text>{' '}
          {new Date(milkBatch.expiryDate).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>
          🔴 <Text style={styles.bold}>Status:</Text> {milkBatch.status}
        </Text>
      </View>

      {/* Daily Milks */}
      {milkBatch.dailyMilks.map((dailyMilk) => (
        <View style={styles.card} key={dailyMilk.dailyMilkId}>
          <Text style={styles.sectionTitle}>Daily Milk #{dailyMilk.dailyMilkId}</Text>
          <Text style={styles.text}>
            🕓 <Text style={styles.bold}>Shift:</Text> {formatCamelCase(dailyMilk.shift)}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Milk Date:</Text>{' '}
            {new Date(dailyMilk.milkDate).toLocaleDateString()}
          </Text>
          <Text style={styles.text}>
            🥛 <Text style={styles.bold}>Volume:</Text> {dailyMilk.volume}L
          </Text>
          <Text style={styles.text}>
            🟢 <Text style={styles.bold}>Status:</Text> {dailyMilk.status}
          </Text>

          {/* Worker Information */}
          <Text style={styles.sectionTitle}>Worker Information</Text>
          <Text style={styles.text}>
            👩‍🔧 <Text style={styles.bold}>Name:</Text> {dailyMilk.worker.name}
          </Text>
          <Text style={styles.text}>
            📞 <Text style={styles.bold}>Phone:</Text> {dailyMilk.worker.phoneNumber || 'N/A'}
          </Text>
          <Text style={styles.text}>
            📧 <Text style={styles.bold}>Email:</Text> {dailyMilk.worker.email}
          </Text>
          <Text style={styles.text}>
            🔑 <Text style={styles.bold}>Employee Number:</Text> {dailyMilk.worker.employeeNumber}
          </Text>
          <Text style={styles.text}>
            👤 <Text style={styles.bold}>Gender:</Text> {dailyMilk.worker.gender}
          </Text>

          {/* Cow Information */}
          <Text style={styles.sectionTitle}>Cow Information</Text>
          <Text style={styles.text}>
            🐄 <Text style={styles.bold}>Name:</Text> {dailyMilk.cow.name}
          </Text>
          <Text style={styles.text}>
            🐄 <Text style={styles.bold}>Status:</Text> {formatCamelCase(dailyMilk.cow.cowStatus)}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Date of Birth:</Text>{' '}
            {new Date(dailyMilk.cow.dateOfBirth).toLocaleDateString()}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Date of Enter:</Text>{' '}
            {new Date(dailyMilk.cow.dateOfEnter).toLocaleDateString()}
          </Text>
          <Text style={styles.text}>
            📍 <Text style={styles.bold}>Origin:</Text> {formatCamelCase(dailyMilk.cow.cowOrigin)}
          </Text>
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
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
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
