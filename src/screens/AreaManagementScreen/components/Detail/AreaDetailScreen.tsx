import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Image, FlatList, RefreshControl } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { RouteProp, useRoute } from '@react-navigation/native';
import { formatCamelCase, formatType } from '@utils/format';
import { t } from 'i18next';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';

type RootStackParamList = {
  AreaDetail: { areaId: number };
};

type AreaDetailScreenProp = RouteProp<RootStackParamList, 'AreaDetail'>;

interface FeedMeal {
  itemName: string;
  quantity: number;
}

interface Cow {
  cowId: number;
  name: string;
  cowStatus: string;
  cowType: string;
  penId: number;
  penName: string;
  feedMeals: FeedMeal[];
}

interface CowApiResponse {
  code: number;
  message: string;
  timestamp: number;
  data: Cow[];
}

// Fetch area details
const fetchAreaDetails = async (areaId: number): Promise<Area> => {
  const response = await apiClient.get(`/areas/${areaId}`);
  return response.data;
};

// Fetch cows in the area
const fetchCowsInArea = async (areaId: number): Promise<Cow[]> => {
  const response = await apiClient.get<CowApiResponse>(`/cows/area/${areaId}`);
  return response.data; // Note: Changed from response.data to response.data.data based on your CowApiResponse structure
};

const AreaDetailScreen = () => {
  const route = useRoute<AreaDetailScreenProp>();
  const { areaId } = route.params;

  const {
    data: area,
    isLoading: isAreaLoading,
    isError: isAreaError,
    refetch: refetchArea,
  } = useQuery(['areas', areaId], () => fetchAreaDetails(areaId));

  const {
    data: cows,
    isLoading: isCowsLoading,
    isError: isCowsError,
    refetch: refetchCows,
  } = useQuery(['cows', areaId], () => fetchCowsInArea(areaId));

  const [expandedId, setExpandedId] = useState<number | null>(null); // Track which cow card is expanded
  const [refreshing, setRefreshing] = useState(false); // Track refresh state

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchArea(), refetchCows()]); // Refetch both area and cows data
    setRefreshing(false);
  };

  if (isAreaLoading || isCowsLoading) {
    return <LoadingSplashScreen />;
  }

  if (isAreaError || !area || isCowsError) {
    return <Text style={styles.errorText}>{t('Failed to load area details')}</Text>;
  }

  const handlePress = (cowId: number) => {
    setExpandedId(expandedId === cowId ? null : cowId); // Toggle expansion
  };

  const renderFeedMeal = ({ item }: { item: FeedMeal }) => (
    <Card style={styles.feedMealCard}>
      <Card.Content style={styles.feedMealContent}>
        <View style={styles.feedMealIconContainer}>
          <List.Icon icon='food' color='#6200ee' />
        </View>
        <View style={styles.feedMealDetails}>
          <Text style={styles.feedMealTitle}>{item.itemName}</Text>
          <Text style={styles.feedMealQuantity}>{`${item.quantity} kg`}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCow = ({ item }: { item: Cow }) => (
    <List.Accordion
      title={
        <View>
          <Text style={styles.cowText}>
            <Text style={styles.bold}>{t('cowDetails.typeName')}: </Text> {item.name}
          </Text>
          <Text style={styles.cowText}>
            <Text style={styles.bold}>{t('cowDetails.status')}: </Text>
            {formatCamelCase(
              t(`data.cowStatus.${item.cowStatus}`, {
                defaultValue: item.cowStatus,
              })
            )}
          </Text>
          <Text style={styles.cowText}>
            <Text style={styles.bold}>{t('cowDetails.type')}: </Text> {item.cowType}
          </Text>
          <Text style={styles.cowText}>
            <Text style={styles.bold}>{t('cowDetails.inPen')}: </Text> {item.penName}
          </Text>
        </View>
      }
      titleStyle={styles.cowTitle}
      style={styles.cowCard}
      expanded={expandedId === item.cowId}
      onPress={() => handlePress(item.cowId)}
      left={(props) => <List.Icon {...props} icon='cow' />}
    >
      <View style={styles.cowContent}>
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>{t('feed.title', { defaultValue: 'Feed Meals' })}</Text>
        <FlatList
          data={item.feedMeals}
          renderItem={renderFeedMeal}
          keyExtractor={(feed) => `${item.cowId}-${feed.itemName}`}
          scrollEnabled={false}
        />
      </View>
    </List.Accordion>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Area Image */}
      <Image
        source={{
          uri: 'https://cdn.britannica.com/62/60562-050-2A18D89A/much-Russia-parts-climate-zone-Europe-Midwest.jpg',
        }}
        style={styles.image}
      />

      {/* Area Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{area.name}</Text>
          <Text style={styles.text}>
            📏 <Text style={styles.bold}>{t('Dimension')}: </Text> {area.width}m x {area.length}m
          </Text>
          <Text style={styles.text}>
            📏 <Text style={styles.bold}>{t('Pen Dimension')}: </Text> {area.penWidth}m x
            {area.penLength}m
          </Text>
          <Text style={styles.text}>
            📍 <Text style={styles.bold}>{t('Area Type')}: </Text>
            {formatType(t(`data.${area.areaType}`))}
          </Text>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.text, styles.bold]}>📖 {t('Description')}: </Text>
            <Text>{area.description}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Timestamps */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📅 {t('Timestamps')}</Text>
          <Text style={styles.text}>
            🕒 <Text style={styles.bold}>{t('Created At')}:</Text>{' '}
            {new Date(area.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            🕒 <Text style={styles.bold}>{t('Updated At')}:</Text>{' '}
            {new Date(area.updatedAt).toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      {/* Cows in Area */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            🐄 {t('area.Cows_in_Area', { defaultValue: 'Cows in Area' })}
          </Text>
          {cows && cows.length > 0 ? (
            <FlatList
              data={cows}
              renderItem={renderCow}
              keyExtractor={(item) => item.cowId.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.text}>
              {t('area.No_cows_found_in_this_area', { defaultValue: 'No cows found in this area' })}
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
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
  cowCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  cowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cowContent: {
    padding: 10,
    marginRight: 14,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  cowText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  divider: {
    marginVertical: 10,
  },
  feedMealCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  feedMealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feedMealIconContainer: {
    marginRight: 12,
  },
  feedMealDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedMealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  feedMealQuantity: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default AreaDetailScreen;
