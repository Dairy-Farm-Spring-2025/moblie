import CardComponent from '@components/Card/CardComponent';
import DividerUI from '@components/UI/DividerUI';
import TagUI from '@components/UI/TagUI';
import TextTitle from '@components/UI/TextTitle';
import { FeedMeals } from '@model/Feed/Feed';
import { useNavigation } from '@react-navigation/native';
import {
  calculateTotalQuantity,
  filteredHay,
  filteredMineral,
  filteredRefined,
  filteredSilage,
} from '@utils/filter/filterFood';
import { formatCamelCase } from '@utils/format';
import { t } from 'i18next';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Tooltip } from 'react-native-paper';

interface CardFeedProps {
  item: FeedMeals;
  navigation: any;
}

const CardFeed = ({ item, navigation }: CardFeedProps) => {
  const filterHay = filteredHay(item.feedMealDetails);
  const filterRefined = filteredRefined(item.feedMealDetails);
  const filterSilage = filteredSilage(item.feedMealDetails);
  const filterMineral = filteredMineral(item.feedMealDetails);
  return (
    <CardComponent style={styles.card}>
      <TouchableOpacity style={styles.cardWrapper} onPress={navigation}>
        <View style={styles.titleContainer}>
          <View style={styles.title}>
            <Text>{item.name}</Text>
            <Tooltip enterTouchDelay={100} title={t('feed.cow_type')}>
              <TagUI>{item.cowTypeEntity.name}</TagUI>
            </Tooltip>
            <Tooltip enterTouchDelay={100} title={t('feed.cow_status')}>
              <TagUI>
                {formatCamelCase(item.cowStatus ? item.cowStatus : 'N/A')}
              </TagUI>
            </Tooltip>
          </View>
        </View>
        <DividerUI />
        <View style={styles.contentContainer}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: 'green',
            }}
          >
            {t('feed.food_nutrition')}:
          </Text>
          <View style={styles.content}>
            <TextTitle
              title={t('feed.hay')}
              content={`${calculateTotalQuantity(filterHay)} kg`}
            />
            <TextTitle
              title={t('feed.refined')}
              content={`${calculateTotalQuantity(filterRefined)} kg`}
            />
            <TextTitle
              title={t('feed.silage')}
              content={`${calculateTotalQuantity(filterSilage)} kg`}
            />
            <TextTitle
              title={t('feed.mineral')}
              content={`${calculateTotalQuantity(filterMineral)} kg`}
            />
          </View>
          <View style={styles.content}>
            <TextTitle
              title={t('feed.quantity')}
              content={`${calculateTotalQuantity(item.feedMealDetails)} kg`}
            />
          </View>
          <TextTitle
            title={t('feed.shift')}
            content={formatCamelCase(item.shift ? item.shift : 'N/A')}
          />
        </View>
      </TouchableOpacity>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  cardWrapper: {
    width: '100%',
    padding: 10,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  contentContainer: {
    flexDirection: 'column',
    gap: 10,
  },
});

export default CardFeed;
