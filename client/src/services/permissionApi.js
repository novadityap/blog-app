import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';

const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    listPermissions: builder.query({
      query: () => {
        return  {
          url: '/permissions/list',
          method: 'GET',
        }
      } ,
    }),
  }),
});

export const { useListPermissionsQuery, useLazyListPermissionsQuery } = permissionApi;
 
export default permissionApi;
