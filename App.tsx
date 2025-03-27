import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Routes } from '@config/routes/Routes';
import { Provider } from 'react-redux';
import { store } from './src/core/store/store';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18next, { i18nPromise } from '@config/locales/i18next';
import 'intl-pluralrules';
import { View } from 'react-native';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    i18nPromise
      .then(() => {
        setIsI18nInitialized(true);
      })
      .catch((error) => {
        console.error('Failed to initialize i18n:', error);
        setIsI18nInitialized(true); // Proceed even if there's an error
      });
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#6200ee' />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18next}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <PaperProvider>
              <Routes />
            </PaperProvider>
          </QueryClientProvider>
        </Provider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
};

export default App;
