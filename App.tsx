import React from 'react';
import { Routes } from '@config/routes/Routes';
import { Provider } from 'react-redux';
import { store } from './src/core/store/store';
import { PaperProvider } from 'react-native-paper';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Routes />
      </PaperProvider>
    </Provider>
  );
};

export default App;
