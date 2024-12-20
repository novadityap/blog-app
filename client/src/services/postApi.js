import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';

const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    createPost: builder.mutation({
      query: data => ({
        url: '/posts',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    getPosts: builder.query({
      query: (params = {}) => ({
        url: '/posts',
        method: 'GET',
        params,
      }),
    }),
    getPostById: builder.query({
      query: id => ({
        url: `/posts/${id}`,
        method: 'GET',
      }),
    }),
    deletePost: builder.mutation({
      query: id => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
    }),
    updatePost: builder.mutation({
      query: ({ data, id }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery,
  useDeletePostMutation,
  useUpdatePostMutation,
} = postApi;

export default postApi;
