import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { RouteProp, useRoute } from '@react-navigation/native';
import { formatType } from '@utils/format';
import { t } from 'i18next';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';

type RootStackParamList = {
  AreaDetail: { areaId: number };
};

type AreaDetailScreenProp = RouteProp<RootStackParamList, 'AreaDetail'>;

const fetchAreaDetails = async (areaId: number): Promise<Area> => {
  const response = await apiClient.get(`/areas/${areaId}`);
  return response.data;
};
const AreaDetailScreen = () => {
  const route = useRoute<AreaDetailScreenProp>();
  const { areaId } = route.params;
  const {
    data: area,
    isLoading,
    isError,
  } = useQuery(['areas', areaId], () => fetchAreaDetails(areaId));

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading area details...</Text>;
  }

  if (isError || !area) {
    return <Text style={styles.errorText}>Failed to load area details</Text>;
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
        <Text style={styles.title}>{area.name}</Text>
        <Text style={styles.text}>
          📏 <Text style={styles.bold}>{t('Dimension')}:</Text> {area.width}m x {area.length}m
        </Text>
        <Text style={styles.text}>
          📏 <Text style={styles.bold}>{t('Pen Dimension')}:</Text> {area.penWidth}m x{' '}
          {area.penLength}m
        </Text>
        <Text style={styles.text}>
          📍 <Text style={styles.bold}>{t('Area Type')}:</Text> {formatType(area.areaType)}
        </Text>
        <View
          style={{
            flexDirection: 'column',
          }}
        >
          <Text style={[styles.text, styles.bold]}>📖 {t('Description')}:</Text>
          <Text>{area.description}</Text>
        </View>
      </View>

      {/* Thông tin loại bò */}

      {/* Thời gian tạo/cập nhật */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📅 {t('Timestamps')}</Text>
        <Text style={styles.text}>
          🕒 <Text style={styles.bold}>Created At:</Text>{' '}
          {new Date(area.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.text}>
          🕒 <Text style={styles.bold}>{t('Updated At')}:</Text>{' '}
          {new Date(area.updatedAt).toLocaleString()}
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
export default AreaDetailScreen;
