import React, { useState } from 'react';
import { ReactNode } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SafeAreaView>
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
