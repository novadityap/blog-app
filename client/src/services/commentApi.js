import axiosBaseQuery from '@/lib/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

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
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Comment', id })),
              { type: 'Comment', id: 'LIST' },
            ]
          : [{ type: 'Comment', id: 'LIST' }],
    }),
    createComment: builder.mutation({
      query: ({ data, postId }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
        { type: 'Comment', id: 'LIST' },
      ],
    }),
    listCommentsByPost: builder.query({
      query: postId => ({
        url: `/posts/${postId}/comments`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [
        ...(result?.data?.map(({ id }) => ({ type: 'Comment', id })) || []),
        { type: 'Comment', id: postId },
        { type: 'Comment', id: 'LIST' },
      ],
    }),
    showComment: builder.query({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { commentId }) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: 'LIST' },
      ],
    }),
    removeComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId, commentId }) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: postId },
        { type: 'Comment', id: 'LIST' },
      ],
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
