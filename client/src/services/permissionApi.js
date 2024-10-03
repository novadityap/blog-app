import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';

const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    getPermissions: builder.query({
      query: (params = {}) => {
        return  {
          url: '/permissions',
          method: 'GET',
          params
        }
      } ,
    }),
    createPermission: builder.mutation({
      query: data => ({
        url: '/permissions',
        method: 'POST',
        data
      })
    }),
    updatePermission: builder.mutation({
      query: ({ id, data }) => ({
        url: `/permissions/${id}`,
        method: 'PUT',
        data
      })
    }),
    deletePermission: builder.mutation({
      query: id => ({
        url: `/permissions/${id}`,
        method: 'DELETE'
      })
    }),
    getPermissionById: builder.query({
      query: id => ({
        url: `/permissions/${id}`,
        method: 'GET'
      })
    }),
  }),
});

export const { 
  useGetPermissionsQuery,
  useLazyGetPermissionsQuery,
  useCreatePermissionMutation,
  useLazyGetPermissionByIdQuery,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
 } = permissionApi;
 
export default permissionApi;
