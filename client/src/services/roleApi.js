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
      query: roleId => ({
        url: `/roles/${roleId}`,
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
      query: ({ roleId, data }) => ({
        url: `/roles/${roleId}`,
        method: 'PUT',
        data,
      }),
    }),
    removeRole: builder.mutation({
      query: roleId => ({
        url: `/roles/${roleId}`,
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
