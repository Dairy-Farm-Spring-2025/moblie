import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { MilkBatch } from '@model/Milk/MilkBatch/MilkBatch';
import { formatCamelCase } from '@utils/format';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  // Prepare data for the pie chart
  const pieChartData = milkBatch.dailyMilks.map((dailyMilk, index) => ({
    name: `Cow ${dailyMilk.cow.name}`,
    volume: dailyMilk.volume,
    color: index % 2 === 0 ? '#4CAF50' : '#81C784', // Alternating shades of green
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Milk Batch Information */}
      <View style={styles.card}>
        <Text style={styles.title}>Milk Batch #{milkBatch.milkBatchId}</Text>
        <View style={styles.infoRow}>
          <Ionicons name='water-outline' size={20} color='#4CAF50' />
          <Text style={styles.text}>
            <Text style={styles.bold}>Total Volume:</Text> {milkBatch.totalVolume}L
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name='calendar-outline' size={20} color='#4CAF50' />
          <Text style={styles.text}>
            <Text style={styles.bold}>Date:</Text> {new Date(milkBatch.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name='calendar-outline' size={20} color='#4CAF50' />
          <Text style={styles.text}>
            <Text style={styles.bold}>Expiry Date:</Text>{' '}
            {new Date(milkBatch.expiryDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name='ellipse'
            size={20}
            color={milkBatch.status === 'inventory' ? '#4CAF50' : '#E53935'}
          />
          <Text style={styles.text}>
            <Text style={styles.bold}>Status:</Text> {milkBatch.status}
          </Text>
        </View>
      </View>

      {/* Pie Chart for Daily Milk Contributions */}
      {milkBatch.dailyMilks.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Milk Volume by Cow (liters)</Text>
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
        </View>
      )}

      {/* Daily Milks */}
      {milkBatch.dailyMilks.map((dailyMilk) => (
        <View style={styles.card} key={dailyMilk.dailyMilkId}>
          <Text style={styles.sectionTitle}>Daily Milk #{dailyMilk.dailyMilkId}</Text>
          <View style={styles.infoRow}>
            <Ionicons name='time-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Shift:</Text> {formatCamelCase(dailyMilk.shift)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Milk Date:</Text>{' '}
              {new Date(dailyMilk.milkDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='water-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Volume:</Text> {dailyMilk.volume}L
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name='ellipse'
              size={20}
              color={dailyMilk.status === 'pending' ? '#FFA500' : '#4CAF50'}
            />
            <Text style={styles.text}>
              <Text style={styles.bold}>Status:</Text> {dailyMilk.status}
            </Text>
          </View>

          {/* Worker Information */}
          <Text style={styles.sectionTitle}>Worker Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name='person-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Name:</Text> {dailyMilk.worker.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='call-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Phone:</Text> {dailyMilk.worker.phoneNumber || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='mail-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Email:</Text> {dailyMilk.worker.email}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='key-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Employee Number:</Text> {dailyMilk.worker.employeeNumber}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='male-female-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Gender:</Text> {dailyMilk.worker.gender}
            </Text>
          </View>

          {/* Cow Information */}
          <Text style={styles.sectionTitle}>Cow Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name='paw-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Name:</Text> {dailyMilk.cow.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='ellipse' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Status:</Text> {formatCamelCase(dailyMilk.cow.cowStatus)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Date of Birth:</Text>{' '}
              {new Date(dailyMilk.cow.dateOfBirth).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='calendar-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Date of Enter:</Text>{' '}
              {new Date(dailyMilk.cow.dateOfEnter).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='globe-outline' size={20} color='#4CAF50' />
            <Text style={styles.text}>
              <Text style={styles.bold}>Origin:</Text> {formatCamelCase(dailyMilk.cow.cowOrigin)}
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
