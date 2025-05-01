import axiosBaseQuery from '@/app/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import sanitizeData from '@/utils/sanitizeData';

const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    searchRoles: builder.query({
      query: params => ({
        url: '/roles/search',
        method: 'GET',
        params,
      }),
    }),
    listRoles: builder.query({
      query: () => ({
        url: '/roles',
        method: 'GET',
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
        data: sanitizeData(data),
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
  useListRolesQuery,
  useLazyListRolesQuery,
  useShowRoleQuery,
  useLazyShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} = roleApi;

export default roleApi;
