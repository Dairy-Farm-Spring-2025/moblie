import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '@components/layout/Layout';
import { t } from 'i18next';

const SettingsScreen: React.FC = () => {
  return (
    <Layout>
      <View>
        <Text>{t('SettingsScreen')}</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({});

export default SettingsScreen;
