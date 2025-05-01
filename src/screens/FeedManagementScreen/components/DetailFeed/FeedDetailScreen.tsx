import CardComponent from '@components/Card/CardComponent';
import ContainerComponent from '@components/Container/ContainerComponent';
import DividerUI from '@components/UI/DividerUI';
import apiClient from '@config/axios/axios';
import { FeedMealDetails, FeedMeals } from '@model/Feed/Feed';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  calculateTotalQuantity,
  filteredHay,
  filteredMineral,
  filteredRefined,
  filteredSilage,
} from '@utils/filter/filterFood';
import { formatCamelCase } from '@utils/format';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import TableFeed from './components/TableFeed';
import { COLORS } from '@common/GlobalStyle';
type RootStackParamList = {
  FeedDetail: { feedId: number };
};

type FeedDetailScreenProp = RouteProp<RootStackParamList, 'FeedDetail'>;

const fetchFeed = async (id: number): Promise<FeedMeals> => {
  const response = await apiClient.get(`/feedmeals/${id}`);
  return response.data;
};

const FeedDetailScreen = () => {
  const route = useRoute<FeedDetailScreenProp>();
  const { feedId } = route.params;
  const {
    data: feed,
    isLoading,
    isError,
    error,
  } = useQuery(['feedmeals', feedId], () => fetchFeed(feedId));
  const [hay, setHay] = useState<FeedMealDetails[]>([]);
  const [refined, setRefined] = useState<FeedMealDetails[]>([]);
  const [silage, setSilage] = useState<FeedMealDetails[]>([]);
  const [mineral, setMineral] = useState<FeedMealDetails[]>([]);
  useEffect(() => {
    if (feed) {
      const filterHay = filteredHay(feed.feedMealDetails);
      const filterRefined = filteredRefined(feed.feedMealDetails);
      const filterSilage = filteredSilage(feed.feedMealDetails);
      const filterMineral = filteredMineral(feed.feedMealDetails);
      setHay(filterHay);
      setRefined(filterRefined);
      setSilage(filterSilage);
      setMineral(filterMineral);
    }
  }, [feed]);

  useEffect(() => {
    if (isError) {
      Alert.alert(t('Error'), (error as Error)?.message);
    }
  }, []);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <ContainerComponent.ScrollView style={styles.container}>
      {/* <Text style={[styles.text, styles.textBold]}>
        {feed?.shift
          ? `${feed?.shift === 'morningShift' ? '☀️' : '🌙'} ${formatCamelCase(feed?.shift)}`
          : 'N/A'}
      </Text> */}
      <View style={styles.titleContainer}>
        <Text style={styles.textName}>🍔 {feed?.name}</Text>
        <Text
          style={[
            styles.textBold,
            {
              fontSize: 15,
            },
          ]}
        >
          🐮 {t('feed.cow_type')}:{' '}
          <Text style={{ fontWeight: '600' }}>
            {feed?.cowTypeEntity ? formatCamelCase(feed?.cowTypeEntity.name) : 'N/A'}
          </Text>
        </Text>
        <Text
          style={[
            styles.textBold,
            {
              fontSize: 15,
            },
          ]}
        >
          🐄 {t('feed.cow_status')}:{' '}
          <Text style={{ fontWeight: '600' }}>
            {feed?.cowStatus ? t(formatCamelCase(feed?.cowStatus)) : 'N/A'}
          </Text>
        </Text>
        <Text
          style={[
            styles.textBold,
            {
              fontSize: 15,
            },
          ]}
        >
          📦 {t('feed.quantity')}:{' '}
          <Text style={{ fontWeight: '600' }}>
            {feed ? calculateTotalQuantity(feed.feedMealDetails) : 0} (kg)
          </Text>
        </Text>
        <DividerUI />
        <Text
          style={[
            styles.text,
            {
              color: 'green',
              fontWeight: '700',
            },
          ]}
        >
          {t('feed.feedmeal_detail')}
        </Text>
      </View>
      <ContainerComponent
        style={{
          flexDirection: 'column',
          gap: 15,
          paddingVertical: 10,
        }}
      >
        <CardComponent>
          <TableFeed items={hay} feed='hay' />
        </CardComponent>
        <DividerUI />
        <CardComponent>
          <TableFeed items={refined} feed='refined' />
        </CardComponent>
        <DividerUI />
        <CardComponent>
          <TableFeed items={silage} feed='silage' />
        </CardComponent>
        <DividerUI />
        <CardComponent>
          <TableFeed items={mineral} feed='mineral' />
        </CardComponent>
      </ContainerComponent>
    </ContainerComponent.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  text: {
    fontSize: 20,
  },
  textBold: {
    fontWeight: '300',
  },
  textName: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.primary,
  },
  titleContainer: {
    marginTop: 10,
    flexDirection: 'column',
    gap: 10,
  },
});

export default FeedDetailScreen;
