import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation(); // Access the navigation object
  return (
    <View style={styles.container}>
      <Text>{t('Welcome This is Splash Screen')}</Text>
      <Button
        title='Navigate'
        onPress={() => {
          (navigation.navigate as any)('Login');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeScreen;
