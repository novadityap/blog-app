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

    if (err.response.status === 401) {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          null,
          { withCredentials: true }
        );

        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        store.dispatch(setToken(data.data.token));
        return axiosInstance(originalRequest);
      } catch (refrehError) {
        if (refrehError.response.status === 401) {
          store.dispatch(clearAuth());
        }

        return Promise.reject(refrehError);
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
