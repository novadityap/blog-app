import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery.js';
import sanitizeData from '@/utils/sanitizeData.js';

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
    }),
    searchPosts: builder.query({
      query: params => ({
        url: '/posts/search',
        method: 'GET',
        params,
      }),
    }),
    showPost: builder.query({
      query: postId => ({
        url: `/posts/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => {
        console.log('provide postId', postId);
        return [{ type: 'Post', id: postId }];
      },
    }),
    removePost: builder.mutation({
      query: postId => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
    }),
    updatePost: builder.mutation({
      query: ({ data, postId }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        data: sanitizeData(data),
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    likePost: builder.mutation({
      query: postId => ({
        url: `/posts/${postId}/like`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, postId) => {
        console.log('invalid postId', postId);
        return [{ type: 'Post', id: postId }];
      },
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
