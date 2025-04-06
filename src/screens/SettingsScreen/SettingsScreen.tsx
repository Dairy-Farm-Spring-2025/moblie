import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '@components/layout/Layout';
import { useTranslation } from 'react-i18next';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
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
