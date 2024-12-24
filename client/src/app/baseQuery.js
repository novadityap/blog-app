import axiosInstance from './interceptor.js';

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
