import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Tooltip } from 'react-native-paper';
import { Cow, Gender } from '@model/Cow/Cow';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import { Ionicons } from '@expo/vector-icons';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import DividerUI from '@components/UI/DividerUI';
import useRoleColor from '@utils/hooks/hooks';
import { t } from 'i18next';

interface CardCowProps {
  cow: Cow | undefined;
  onPress?: () => void;
  width?: number;
}

const CardCow: React.FC<CardCowProps> = ({ cow, onPress, width }) => {
  if (!cow) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.cardTitle}>{t('card_cow.no_cow_data')}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardWrapper}>
        <View style={styles.cardHeader}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Text style={styles.cardTitle}>{cow.name || t('card_cow.unnamed')}</Text>
            {cow.gender === Gender.MALE ? (
              <Ionicons name='male' size={15} color='blue' />
            ) : (
              <Ionicons name='female' color='red' size={15} />
            )}
          </View>
          <Tooltip title={t('card_cow.cow_type')}>
            <Text style={[styles.cardType, { backgroundColor: useRoleColor() }]}>
              {cow.cowType?.name || 'N/A'}
            </Text>
          </Tooltip>
        </View>
        <DividerUI />
        <View style={styles.cardContent}>
          {cow?.penResponse && (
            <TextRenderHorizontal
              title={t('card_cow.pen', { defaultValue: 'Pen' })}
              content={cow?.penResponse ? formatCamelCase(cow?.penResponse?.name) : 'N/A'}
            />
          )}
          <TextRenderHorizontal
            title={t('card_cow.origin', { defaultValue: 'Origin' })}
            content={t(formatCamelCase(cow.cowOrigin || 'N/A'))}
          />
          <TextRenderHorizontal
            title={t('card_cow.born', { defaultValue: 'Day of birth' })}
            content={convertToDDMMYYYY(cow.dateOfBirth || 'N/A')}
          />
          <TextRenderHorizontal
            title={t('card_cow.dayOfEnter', { defaultValue: 'Day of enter' })}
            content={convertToDDMMYYYY(cow.dateOfEnter || 'N/A')}
          />
          <TextRenderHorizontal
            title={t('card_cow.status', { defaultValue: 'Status' })}
            content={t(cow.cowStatus ? formatCamelCase(cow.cowStatus) : 'N/A')}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardType: {
    padding: 4,
    borderRadius: 5,
    color: 'white',
    fontSize: 10,
  },
  cardContent: {
    flexDirection: 'column',
    marginTop: 10,
  },
  cardDetails: {
    fontSize: 12,
    color: 'gray',
  },
});

export default CardCow;
