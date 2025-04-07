import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Layout from '@components/layout/Layout';
import axios from 'axios';
import { Button } from 'react-native-paper';
import { updateNewAccessToken } from '@core/store/authSlice';
import { store } from '@core/store/store';
import apiClient from '@config/axios/axios';
import { t } from 'i18next';

const AboutScreen: React.FC = () => {
  const testApiCall = async () => {
    try {
      // Manually set an expired token
      store.dispatch(updateNewAccessToken('expired_token'));

      // Make an API request that should fail with 401
      const response = await apiClient.get('/protected-resource');
      console.log('API Response:', response);
    } catch (error) {
      console.error('API Call Error:', error);
      Alert.alert('API Call Failed', 'Check console logs');
    }
  };

  return (
    <Layout>
      <View>
        <Text>{t('AboutScreen')}</Text>
        <Button onPress={() => testApiCall()}>Refresh Token</Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({});

export default AboutScreen;
