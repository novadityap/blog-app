import {configureStore} from "@reduxjs/toolkit";
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import queryReducer from '@/features/querySlice.js';
import authReducer from '@/features/authSlice.js';
import authApi from '@/services/authApi.js';
import postApi from "@/services/postApi.js";
import userApi from "@/services/userApi.js";
import roleApi from "@/services/roleApi.js";
import categoryApi from '@/services/categoryApi.js';
import dashboardApi from '@/services/dashboardApi.js';
import commentApi from '@/services/commentApi.js';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
}

const authPersistConfig = {
  key: 'auth',
  storage,
}

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer,
  query: queryReducer,
  auth: persistReducer(authPersistConfig, authReducer)
});

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    }
  }).concat(
    authApi.middleware, 
    postApi.middleware, 
    userApi.middleware,
    roleApi.middleware,
    categoryApi.middleware,
    dashboardApi.middleware,
    commentApi.middleware,
  ),
});

export const persistor = persistStore(store);
