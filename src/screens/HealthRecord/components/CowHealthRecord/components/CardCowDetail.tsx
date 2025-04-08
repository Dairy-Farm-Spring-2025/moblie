import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import { Cow } from '@model/Cow/Cow';
import { formatType } from '@utils/format';
import { t } from 'i18next';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface CardCowDetailProps {
  cow: Cow;
}

const CardCowDetail = ({ cow }: CardCowDetailProps) => {
  return (
    <CardComponent>
      <CardComponent.Title
        title={cow?.name}
        subTitle={cow?.dateOfBirth}
        leftContent={(props: any) => <LeftContent {...props} icon='folder' />}
      />
      <CardComponent.Content>
        <Text style={styles.text}>
          🐄 <Text style={styles.bold}>{t('Status')}:</Text> {formatType(cow?.cowStatus as string)}
        </Text>
        <Text style={styles.text}>
          📅 <Text style={styles.bold}>{t('Date Entered')}:</Text> {cow?.dateOfEnter}
        </Text>
        <Text style={styles.text}>
          📍 <Text style={styles.bold}>{t('Origin')}:</Text> {formatType(cow?.cowOrigin as string)}
        </Text>
        <Text style={styles.text}>
          ⚧ <Text style={styles.bold}>{t('Gender')}:</Text> {formatType(cow?.gender as string)}
        </Text>
        <Text style={styles.text}>
          🛠 <Text style={styles.bold}>{t('Type')}:</Text> {cow?.cowType.name}
        </Text>
      </CardComponent.Content>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default CardCowDetail;
