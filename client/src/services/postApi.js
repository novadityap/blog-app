import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';
import buildFormData from '@/utils/buildFormData.js';

const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Post'],
  endpoints: builder => ({
    createPost: builder.mutation({
      query: data => ({
        url: '/posts',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    searchPosts: builder.query({
      query: params => ({
        url: '/posts/search',
        method: 'GET',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Post', id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    showPost: builder.query({
      query: postId => ({
        url: `/posts/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    removePost: builder.mutation({
      query: postId => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    updatePost: builder.mutation({
      query: ({ data, postId }) => ({
        url: `/posts/${postId}`,
        method: 'PATCH',
        data: buildFormData(data, {
          fileFields: 'avatar',
          isMultiple: false,
        }),
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    likePost: builder.mutation({
      query: postId => ({
        url: `/posts/${postId}/like`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
      ],
    }),
  }),
});

export const {
  useSearchPostsQuery,
  useLazySearchPostsQuery,
  useShowPostQuery,
  useLazyShowPostQuery,
  useLikePostMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
  useRemovePostMutation,
} = postApi;

export default postApi;
