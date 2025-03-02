import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Tooltip } from 'react-native-paper';
import { Cow } from '@model/Cow/Cow';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';

interface CardCowProps {
  cow: Cow | undefined;
  onPress: () => void;
  width?: number;
}

const CardCow: React.FC<CardCowProps> = ({ cow, onPress, width }) => {
  // If cow is undefined, return a fallback UI
  if (!cow) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.cardTitle}>No Cow Data</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/200/300' }} // Replace with cow image
          style={styles.cardImage}
        />
        {cow.inPen ? (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{cow.penResponse?.name || 'N/A'}</Text>
          </View>
        ) : (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Pen: No</Text>
          </View>
        )}
        {cow.inPen ? (
          <View style={styles.overlayArea}>
            <Text style={styles.overlayTextArea}>{cow.penResponse?.area?.name || 'N/A'}</Text>
          </View>
        ) : (
          <View style={styles.overlayArea}>
            <Text style={styles.overlayTextArea}>Area: No</Text>
          </View>
        )}
      </View>
      <View style={styles.cardWrapper}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{cow.name || 'Unnamed'}</Text>
          <Tooltip title='Cow Type'>
            <Text style={styles.cardType}>{cow.cowType?.name || 'N/A'}</Text>
          </Tooltip>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardDetails}>Origin: {formatCamelCase(cow.cowOrigin || '')}</Text>
          <Text style={styles.cardDetails}>Born: {convertToDDMMYYYY(cow.dateOfBirth || '')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    width: '45%', // For 2-column grid layout
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
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlayArea: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  overlayTextArea: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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

export default CardCow;
