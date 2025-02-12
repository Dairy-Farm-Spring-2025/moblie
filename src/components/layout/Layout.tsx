import React, { ReactNode } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import Header from './Header';
import GlobalStyles from '../../common/GlobalStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SafeAreaView style={[GlobalStyles.droidSafeArea, styles.safeArea]}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1, // Allows the content to expand and scroll if needed
    padding: 20,
  },
});

export default Layout;
