import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery';

const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Comment'],
  endpoints: builder => ({
    searchComments: builder.query({
      query: params => ({
        url: '/comments/search',
        method: 'GET',
        params,
      }),
    }),
    createComment: builder.mutation({
      query: ({ data, postId }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
      ],
    }),
    listCommentsByPost: builder.query({
      query: postId => ({
        url: `/posts/${postId}/comments`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [
        { type: 'Comment', id: postId },
      ],
    }),
    showComment: builder.query({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'GET',
      }),
    }),
    removeComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSearchCommentsQuery,
  useLazySearchCommentsQuery,
  useShowCommentQuery,
  useLazyShowCommentQuery,
  useCreateCommentMutation,
  useRemoveCommentMutation,
  useListCommentsByPostQuery,
} = commentApi;

export default commentApi;
