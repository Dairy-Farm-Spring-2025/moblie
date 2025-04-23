import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { VaccineCycle } from '@model/Cow/Cow';
import { t } from 'i18next';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@common/GlobalStyle';

interface VaccineCycleCardProps {
  cycle: VaccineCycle;
}

const VaccineCycleCard: React.FC<VaccineCycleCardProps> = ({ cycle }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        (navigation.navigate as any)('VaccineCycleDetail', { cycle })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {cycle.name || t('vaccine_cycle.title')}
        </Text>
      </View>
      <Text style={styles.cardSubtitle}>
        {t('card_cow.cow_type')}:{' '}
        {cycle.cowTypeEntity?.name || t('card_cow.unnamed')}
      </Text>
      <RenderHTML
        contentWidth={Dimensions.get('window').width - 40}
        source={{ html: cycle.description }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});

export default VaccineCycleCard;
