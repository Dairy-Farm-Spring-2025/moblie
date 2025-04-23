import { COLORS } from '@common/GlobalStyle';
import TableComponent from '@components/Table/TableComponent';
import { FeedMealDetails } from '@model/Feed/Feed';
import { calculateTotalQuantity } from '@utils/filter/filterFood';
import { t } from 'i18next';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Tooltip } from 'react-native-paper';

interface TableFeedProps {
  items: FeedMealDetails[];
  feed: 'hay' | 'refined' | 'silage' | 'mineral';
}

const TableFeed = ({ items, feed }: TableFeedProps) => {
  const pages = 0;
  const itemPage = 5;
  const from = pages * itemPage;
  const to = Math.min((pages + 1) * itemPage, items.length);
  return (
    <View>
      <Text style={styles.textName}>
        {feed === 'hay'
          ? `🌾 ${t('feed.hay')}`
          : feed === 'refined'
          ? `🌽 ${t('feed.refined')}`
          : feed === 'mineral'
          ? `🧂 ${t('feed.mineral')}`
          : `🌿 ${t('feed.silage')}`}
      </Text>
      <TableComponent>
        <TableComponent.Header>
          <TableComponent.Title>{t('feed.name')}</TableComponent.Title>
          <TableComponent.Title numeric>
            {t('feed.quantity')}
          </TableComponent.Title>
          <TableComponent.Title style={styles.marginCell}>
            {t('feed.storage')}
          </TableComponent.Title>
        </TableComponent.Header>
        {items
          .slice(from, to)
          .map((element: FeedMealDetails, index: number) => (
            <View
              key={element.itemEntity.itemId + element.itemEntity.name + index}
            >
              <TableComponent.Row>
                <TableComponent.Cell>
                  <Tooltip title={element.itemEntity.name}>
                    <Text numberOfLines={1}>{element.itemEntity.name}</Text>
                  </Tooltip>
                </TableComponent.Cell>
                <TableComponent.Cell numeric>
                  {element.itemEntity.quantity} ({element.itemEntity.unit})
                </TableComponent.Cell>
                <TableComponent.Cell style={styles.marginCell}>
                  <Tooltip
                    title={element.itemEntity.warehouseLocationEntity.name}
                  >
                    <Text numberOfLines={1}>
                      {element.itemEntity.warehouseLocationEntity.name}
                    </Text>
                  </Tooltip>
                </TableComponent.Cell>
              </TableComponent.Row>
            </View>
          ))}
        {items.length > itemPage && (
          <TableComponent.Pagination
            items={items}
            page={pages}
            numberOfItemsPerPage={itemPage}
          />
        )}
      </TableComponent>
      <Text
        style={{
          fontWeight: '600',
          color: COLORS.primary,
          marginVertical: 10,
        }}
      >
        {t('feed.quantity')}: {calculateTotalQuantity(items)} (kg)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  marginCell: {
    marginLeft: 25,
  },
  textName: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.primary,
  },
});

export default TableFeed;
