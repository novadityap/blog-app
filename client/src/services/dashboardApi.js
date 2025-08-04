import axiosBaseQuery from '@/lib/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    showDashboard: builder.query({
      query: () => ({
        url: '/dashboard',
        method: 'GET',
      }),
    }),
  }),
});

export const { useShowDashboardQuery, useLazyShowDashboardQuery } = dashboardApi;

export default dashboardApi;