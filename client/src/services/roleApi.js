import axiosBaseQuery from '@/app/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    searchRoles: builder.query({
      query: (params = {}) => ({
        url: '/roles',
        method: 'GET',
        params,
      }),
    }),
    showRole: builder.query({
      query: id => ({
        url: `/roles/${id}`,
        method: 'GET',
      }),
    }),
    createRole: builder.mutation({
      query: data => ({
        url: '/roles',
        method: 'POST',
        data,
      }),
    }),
    updateRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        data,
      }),
    }),
    removeRole: builder.mutation({
      query: id => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSearchRolesQuery,
  useLazySearchRolesQuery,
  useShowRoleQuery,
  useLazyShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} = roleApi;

export default roleApi;
