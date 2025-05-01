import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';
import sanitizeData from '@/utils/sanitizeData.js';

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
    searchUsers: builder.query({
      query: params => ({
        url: '/users/search',
        method: 'GET',
        params,
      }),
    }),
    showUser: builder.query({
      query: userId => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation({
      query: ({ data, userId }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        data: sanitizeData(data),
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    removeUser: builder.mutation({
      query: userId => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useShowUserQuery,
  useLazyShowUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useRemoveUserMutation,
} = userApi;

export default userApi;
