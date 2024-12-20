import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery';

const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    getDashboard: builder.query({
      query: () => ({
        url: '/dashboard',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;

export default dashboardApi;