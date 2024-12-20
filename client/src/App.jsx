import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/app/store.js';
import { Provider } from 'react-redux';
import AppRoute from '@/routes/AppRoute';
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoute />
      </PersistGate>
    </Provider>
  );
};

export default App;
