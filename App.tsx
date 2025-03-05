import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Routes } from '@config/routes/Routes';
import { Provider } from 'react-redux';
import { store } from './src/core/store/store';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18next from '@config/locales/i18next';
const queryClient = new QueryClient();

const App: React.FC = () => {
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
