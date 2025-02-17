import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { Pen } from '@model/Pen/Pen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { formatType } from '@utils/format';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';

type RootStackParamList = {
  PenDetail: { penId: number };
};

type PenDetailScreenProp = RouteProp<RootStackParamList, 'PenDetail'>;

const fetchPenDetails = async (penId: number): Promise<Pen> => {
  const response = await apiClient.get(`/pens/${penId}`);
  return response.data;
};

const PenDetailScreen = () => {
  const route = useRoute<PenDetailScreenProp>();
  const { penId } = route.params;
  const {
    data: pen,
    isLoading,
    isError,
  } = useQuery(['pens', penId], () => fetchPenDetails(penId));

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading pen details...</Text>;
  }

  if (isError || !pen) {
    return <Text style={styles.errorText}>Failed to load pen details</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh bò */}
      <Image
        source={{
          uri: 'https://cdn.britannica.com/62/60562-050-2A18D89A/much-Russia-parts-climate-zone-Europe-Midwest.jpg',
        }}
        style={styles.image}
      />

      {/* Thông tin chi tiết */}
      <View style={styles.card}>
        <Text style={styles.title}>{pen.name}</Text>
        <Text style={styles.text}>
          📏 <Text style={styles.bold}>Dimension:</Text> {pen.area.penWidth}m x{' '}
          {pen.area.penLength}m
        </Text>
        <Text style={styles.text}>
          📼 <Text style={styles.bold}>Pen Type:</Text>{' '}
          {formatType(pen.penType)}
        </Text>
        <Text style={styles.text}>
          📌 <Text style={styles.bold}>Status:</Text>{' '}
          {formatType(pen.penStatus)}
        </Text>
        <Text style={styles.text}>
          📍 <Text style={styles.bold}>Area:</Text> {formatType(pen.area.name)}
        </Text>
        <View
          style={{
            flexDirection: 'column',
          }}
        >
          <Text style={[styles.text, styles.bold]}>📖 Description:</Text>
          <Text>{pen.description}</Text>
        </View>
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
export default PenDetailScreen;
