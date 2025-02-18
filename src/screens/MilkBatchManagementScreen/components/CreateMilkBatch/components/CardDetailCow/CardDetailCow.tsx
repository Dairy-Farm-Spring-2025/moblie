// CardDetailCow.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Tooltip } from 'react-native-paper';
import { Cow } from '@model/Cow/Cow';
import { formatCamelCase } from '@utils/format';

interface CardDetailCowProps {
  cow: Cow | undefined;
  dailyMilk: {
    volume: string | number;
    cowId: number;
  };
  onPress: () => void;
  width?: number;
}

const CardDetailCow: React.FC<CardDetailCowProps> = ({ cow, onPress, width, dailyMilk }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: 'https://picsum.photos/200/300' }} // Replace with cow image
        style={styles.cardImage}
      />
      <View style={styles.cardWrapper}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{cow?.name}</Text>
          <Tooltip title='Cow Type'>
            <Text style={styles.cardType}>{cow?.cowType.name}</Text>
          </Tooltip>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Daily Milk Volume: {dailyMilk?.volume}</Text>
          <Text style={styles.cardDetails}>Origin: {formatCamelCase(cow?.cowOrigin || '')}</Text>
          <Text style={styles.cardDetails}>Born: {cow?.dateOfBirth}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    width: '100%', // For 2-column grid layout
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
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    objectFit: 'fill',
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
    backgroundColor: 'green',
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

export default CardDetailCow;
