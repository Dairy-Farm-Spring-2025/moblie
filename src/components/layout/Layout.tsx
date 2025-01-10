import React, { useState } from 'react';
import { ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import GlobalStyles from '../../common/GlobalStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SafeAreaView style={GlobalStyles.droidSafeArea}>
      <Header />
      <View>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  contentText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Layout;
