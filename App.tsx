import React from 'react';
import { Routes } from '@config/routes/Routes';
import { Provider } from 'react-redux';
import { store } from './src/core/store/store';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <Routes />
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
