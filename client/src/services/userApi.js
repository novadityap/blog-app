import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    createUser: builder.mutation({
      query: data => ({
        url: '/users',
        method: 'POST',
        data,
      }),
    }),
    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
    }),
    getUserById: builder.query({
      query: id => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation({
      query: ({ data, id }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    deleteUser: builder.mutation({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

export default userApi;
