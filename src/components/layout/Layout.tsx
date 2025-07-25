import React, { ReactNode, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import Header from './Header';
import GlobalStyles from '../../common/GlobalStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children?: ReactNode;
  isScrollable?: boolean;
  onRefresh?: () => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({ children, isScrollable = true, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <SafeAreaView style={[GlobalStyles.droidSafeArea, styles.safeArea]}>
      <Header />
      {isScrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor='#000'
              titleColor='#000' // Optional: Text color (iOS)
            />
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, { height: '100%' }]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default Layout;
