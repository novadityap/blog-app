'use client';

import '@/app/globals.css';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store.js';
import { Provider } from 'react-redux';

const RootLayout = ({ children }) => {
  return (
    <html>
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
