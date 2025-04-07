import FloatingButton from '@components/FloatingButton/FloatingButton';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import apiClient from '@config/axios/axios';
import { Cow } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { formatCamelCase } from '@utils/format';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from 'react-query';
import { LogBox } from 'react-native';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import { useTranslation } from 'react-i18next';
import RenderHTML from 'react-native-render-html';

LogBox.ignoreLogs([
  'TRenderEngineProvider: Support for defaultProps will be removed',
  'MemoizedTNodeRenderer: Support for defaultProps will be removed',
  'TNodeChildrenRenderer: Support for defaultProps will be removed',
]);

type RootStackParamList = {
  CowDetails: { cowId: number };
};

type DetailCowRouteProp = RouteProp<RootStackParamList, 'CowDetails'>;

const fetchCowDetails = async (cowId: number): Promise<Cow> => {
  const response = await apiClient.get(`/cows/${cowId}`);
  return response.data;
};

const DetailCow: React.FC = () => {
  const { t } = useTranslation(); // Initialize the translation hook
  const route = useRoute<DetailCowRouteProp>();
  const navigator = useNavigation();
  const { cowId } = route.params;

  const { data: cow, isLoading, isError } = useQuery(['cow', cowId], () => fetchCowDetails(cowId));

  console.log(cow?.inPen);

  const handleNavigateHealthResponse = () => {
    (navigator as any).navigate('CowHealthInforScreen', {
      healthResponses: cow?.healthInfoResponses,
      cowName: cow?.name,
    });
  };

  if (isLoading) {
    return <Text style={styles.loadingText}>{t('cowDetails.loading')}</Text>;
  }

  if (isError || !cow) {
    return <Text style={styles.errorText}>{t('cowDetails.error')}</Text>;
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={{ flex: 1 }}>
      <TitleNameCows title={t('cowDetails.title')} cowName={cow.name} />
      <ScrollView style={styles.container}>
        {/* Thông tin chi tiết */}
        <View style={styles.card}>
          <Text style={styles.title}>{cow.name}</Text>
          <Text style={styles.text}>
            🐄 <Text style={styles.bold}>{t('cowDetails.status')}:</Text>{' '}
            {formatCamelCase(cow.cowStatus)}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('cowDetails.dateOfBirth')}:</Text> {cow.dateOfBirth}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('cowDetails.dateEntered')}:</Text> {cow.dateOfEnter}
          </Text>
          {cow.dateOfOut && (
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('cowDetails.dateOut')}:</Text> {cow.dateOfOut}
            </Text>
          )}
          <Text style={styles.text}>
            📍 <Text style={styles.bold}>{t('cowDetails.origin')}:</Text>{' '}
            {formatCamelCase(cow.cowOrigin)}
          </Text>
          <Text style={styles.text}>
            ⚧ <Text style={styles.bold}>{t('cowDetails.gender')}:</Text>{' '}
            {formatCamelCase(cow.gender)}
          </Text>
          <Text style={styles.text}>
            🏡 <Text style={styles.bold}>{t('cowDetails.inPen')}:</Text>{' '}
            {cow.inPen ? t('cowDetails.inPenYes') : t('cowDetails.inPenNo')}
          </Text>
          <Text style={styles.text}>
            🛠 <Text style={styles.bold}>{t('cowDetails.type')}:</Text>{' '}
            {formatCamelCase(cow.cowType.name)}
          </Text>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.text}>
              📖 <Text style={styles.bold}>{t('cowDetails.description')}:</Text>
            </Text>
            <View style={{ paddingHorizontal: 20 }}>
              <RenderHTML source={{ html: cow.description ? cow.description : '' }} />
            </View>
          </View>
        </View>

        {/* Thông tin chuồng bò */}
        {cow.inPen && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('cowDetails.penInfo')}</Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.penId')}:</Text> {cow.penResponse.penId}
            </Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.penName')}:</Text>{' '}
              {formatCamelCase(cow.penResponse.name)}
            </Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.penStatus')}:</Text>{' '}
              {formatCamelCase(cow.penResponse.penStatus)}
            </Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.penDescription')}:</Text>{' '}
              {cow.penResponse.description}
            </Text>
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('cowDetails.createdAt')}:</Text>{' '}
              {new Date(cow.penResponse.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('cowDetails.updatedAt')}:</Text>{' '}
              {new Date(cow.penResponse.updatedAt).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Thông tin khu vực */}
        {cow.inPen && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('cowDetails.areaInfo')}</Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.areaId')}:</Text>{' '}
              {cow.penResponse.area.areaId}
            </Text>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.areaName')}:</Text>{' '}
              {formatCamelCase(cow.penResponse.area.name)}
            </Text>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.text}>
                🔹 <Text style={styles.bold}>{t('cowDetails.areaDescription')}:</Text>{' '}
              </Text>
              <View style={{ paddingHorizontal: 20 }}>
                <RenderHTML source={{ html: cow.penResponse.area.description }} />
              </View>
            </View>
            <Text style={styles.text}>
              🔹 <Text style={styles.bold}>{t('cowDetails.areaType')}:</Text>{' '}
              {formatCamelCase(cow.penResponse.area.areaType)}
            </Text>
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('cowDetails.createdAt')}:</Text>{' '}
              {new Date(cow.penResponse.area.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.text}>
              📅 <Text style={styles.bold}>{t('cowDetails.updatedAt')}:</Text>{' '}
              {new Date(cow.penResponse.area.updatedAt).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Thông tin loại bò */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('cowDetails.cowTypeDetails')}</Text>
          <Text style={styles.text}>
            🔹 <Text style={styles.bold}>{t('cowDetails.typeId')}:</Text> {cow.cowType.cowTypeId}
          </Text>
          <Text style={styles.text}>
            🔹 <Text style={styles.bold}>{t('cowDetails.typeName')}:</Text>{' '}
            {formatCamelCase(cow.cowType.name)}
          </Text>
          <Text style={styles.text}>
            🔹 <Text style={styles.bold}>{t('cowDetails.typeStatus')}:</Text>{' '}
            {formatCamelCase(cow.cowType.status)}
          </Text>
          <Text style={styles.text}>
            🔹 <Text style={styles.bold}>{t('cowDetails.typeDescription')}:</Text>{' '}
            {cow.cowType.description}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('cowDetails.createdAt')}:</Text>{' '}
            {new Date(cow.cowType.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            📅 <Text style={styles.bold}>{t('cowDetails.updatedAt')}:</Text>{' '}
            {new Date(cow.cowType.updatedAt).toLocaleString()}
          </Text>
        </View>

        {/* Thời gian tạo/cập nhật */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('cowDetails.timestamps')}</Text>
          <Text style={styles.text}>
            🕒 <Text style={styles.bold}>{t('cowDetails.createdAt')}:</Text>{' '}
            {new Date(cow.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            🕒 <Text style={styles.bold}>{t('cowDetails.updatedAt')}:</Text>{' '}
            {new Date(cow.updatedAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
      <FloatingButton onPress={handleNavigateHealthResponse} icon={'heart'} />
    </View>
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
