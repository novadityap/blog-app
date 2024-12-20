import axiosBaseQuery from '@/app/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    getRoles: builder.query({
      query: (params = {}) => ({
        url: '/roles',
        method: 'GET',
        params,
      }),
    }),
    getRoleById: builder.query({
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
    deleteRole: builder.mutation({
      query: id => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useLazyGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;

export default roleApi;
