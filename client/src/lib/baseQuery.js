import axios from 'axios';
import { store } from '@/lib/store.js';
import { setToken, clearAuth } from '@/lib/features/authSlice.js';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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

      const refreshTokenMessages = [
        'Token is not provided',
        'Token is invalid',
        'Token has expired',
      ];

      const ignoredMessages = [
        'Verification token is invalid or has expired',
        'Email or password is invalid',
        'Reset token is invalid or has expired',
      ];

      if (ignoredMessages.includes(message)) return Promise.reject(e);

      if (refreshTokenMessages.includes(message)) {
        try {
          const result = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
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

const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (e) {
      return { error: e.response.data };
    }
  };

export default axiosBaseQuery;
