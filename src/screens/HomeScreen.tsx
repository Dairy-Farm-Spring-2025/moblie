import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';

const HomeScreen: React.FC = () => {
  // Access the auth state
  const { isAuthenticated, role, userId, fullName, token } = useSelector(
    (state: RootState) => state.auth
  );
  return (
    <Layout>
      <View>
        <Text>HomeScreenPage</Text>
        <Text>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</Text>
        <Text>userId: {userId}</Text>
        <Text>fullName: {fullName}</Text>
        <Text>role: {role}</Text>
        <Text>token: {token}</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({});

export default HomeScreen;
