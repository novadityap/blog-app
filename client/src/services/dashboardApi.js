import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery';

const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    showDashboard: builder.query({
      query: () => ({
        url: '/dashboard/stats',
        method: 'GET',
      }),
    }),
  }),
});

export const { useShowDashboardQuery, useLazyShowDashboardQuery } = dashboardApi;

export default dashboardApi;