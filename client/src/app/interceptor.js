import axios from 'axios';
import { store } from '@/app/store.js';
import { setToken, clearAuth } from '@/features/authSlice.js';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  config => {
    const token = store.getState().auth.token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  e => Promise.reject(e)
);

axiosInstance.interceptors.response.use(
  res => res,
  async e => {
    const originalRequest = e.config;

    if (e.response.status === 401) {
      const message = e.response.data.message;

      const signoutMessages = [
        'Token is not provided',
        'Token is invalid',
      ];

      const ignoredMessages = [
        'Verification token is invalid or has expired',
        'Email or password is invalid',
        'Reset token is invalid or has expired',
      ];

      if (ignoredMessages.includes(message)) return Promise.reject(e);

      if (signoutMessages.includes(message)) {
        store.dispatch(clearAuth());
        return Promise.reject(e);
      }

      if (message === 'Token has expired') {
        try {
          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            null,
            { withCredentials: true }
          );

          originalRequest.headers.Authorization = `Bearer ${result.data.data.token}`;
          store.dispatch(setToken(result.data.data.token));
          
          return axiosInstance(originalRequest);
        } catch (e) {
          store.dispatch(clearAuth());
          return Promise.reject(e);
        }
      }
    }

    return Promise.reject(e);
  }
);


export default axiosInstance;
