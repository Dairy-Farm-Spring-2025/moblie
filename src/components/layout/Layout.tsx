import React, { ReactNode } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import Header from './Header';
import GlobalStyles from '../../common/GlobalStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children?: ReactNode;
  isScrollable?: boolean; // Added this prop to conditionally render ScrollView
}

const Layout: React.FC<LayoutProps> = ({ children, isScrollable = true }) => {
  return (
    <SafeAreaView style={[GlobalStyles.droidSafeArea, styles.safeArea]}>
      <Header />
      {isScrollable ? (
        <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
      ) : (
        <View style={styles.container}>{children}</View>
      )}
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
