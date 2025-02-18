import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import RenderHTML from 'react-native-render-html';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import { formatCamelCase } from '@utils/format';

type RootStackParamList = {
  CowDetails: { cowId: number };
};

type DetailCowRouteProp = RouteProp<RootStackParamList, 'CowDetails'>;

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};

const DetailCow: React.FC = () => {
  const route = useRoute<DetailCowRouteProp>();
  const { cowId } = route.params;

  const { data: cow, isLoading, isError } = useQuery(['cow', cowId], () => fetchCowDetails(cowId));

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading cow details...</Text>;
  }

  if (isError || !cow) {
    return <Text style={styles.errorText}>Failed to load cow details</Text>;
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh bò */}
      <Image source={{ uri: 'https://picsum.photos/400/400' }} style={styles.image} />

      {/* Thông tin chi tiết */}
      <View style={styles.card}>
        <Text style={styles.title}>{cow.name}</Text>
        <Text style={styles.text}>
          🐄 <Text style={styles.bold}>Status:</Text> {formatCamelCase(cow.cowStatus)}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Date of Birth:</Text> {cow.dateOfBirth}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Date Entered:</Text> {cow.dateOfEnter}
        </Text>
        {cow.dateOfOut && (
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>Date Out:</Text> {cow.dateOfOut}
          </Text>
        )}
        <Text style={styles.text}>
          📍 <Text style={styles.bold}>Origin:</Text> {formatCamelCase(cow.cowOrigin)}
        </Text>
        <Text style={styles.text}>
          ⚧ <Text style={styles.bold}>Gender:</Text> {formatCamelCase(cow.gender)}
        </Text>
        <Text style={styles.text}>
          🏡 <Text style={styles.bold}>In Pen:</Text> {cow.inPen ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.text}>
          🛠 <Text style={styles.bold}>Type:</Text> {cow.cowType.name}
        </Text>
        <View
          style={{
            flexDirection: 'column',
          }}
        >
          <Text style={styles.text}>
            📖 <Text style={styles.bold}>Description:</Text>
          </Text>
          <RenderHtmlComponent htmlContent={cow.description} />
        </View>
      </View>

      {/* Thông tin loại bò */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🐮 Cow Type Details</Text>
        <Text style={styles.text}>
          🔹 <Text style={styles.bold}>Type ID:</Text> {cow.cowType.cowTypeId}
        </Text>
        <Text style={styles.text}>
          🔹 <Text style={styles.bold}>Name:</Text> {cow.cowType.name}
        </Text>
        <Text style={styles.text}>
          🔹 <Text style={styles.bold}>Status:</Text> {formatCamelCase(cow.cowType.status)}
        </Text>
        <Text style={styles.text}>
          🔹 <Text style={styles.bold}>Description:</Text> {cow.cowType.description}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Created At:</Text>{' '}
          {new Date(cow.cowType.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>Updated At:</Text>{' '}
          {new Date(cow.cowType.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* Thời gian tạo/cập nhật */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📅 Timestamps</Text>
        <Text style={styles.text}>
          🕒 <Text style={styles.bold}>Created At:</Text> {new Date(cow.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.text}>
          🕒 <Text style={styles.bold}>Updated At:</Text> {new Date(cow.updatedAt).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
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

export default DetailCow;
