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
  err => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response && err.response.status === 401) {
      const message = err.response.data.message;

      const invalidMessages = [
        'Invalid token',
        'Invalid verification token',
        'Invalid reset token',
        'Invalid email or password',
        'Invalid refresh token'
      ];

      if (invalidMessages.includes(message)) {
        return Promise.reject(err);
      }

      if (message === 'Token has expired') {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            null,
            { withCredentials: true }
          );

          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
          store.dispatch(setToken(data.data.token));

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          if (refreshError.response && refreshError.response.status === 401) {
            store.dispatch(clearAuth()); 
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
