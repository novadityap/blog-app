import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery';

const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    getComments: builder.query({
      query: (params = {}) => ({
        url: '/comments',
        method: 'GET',
        params,
      }),
    }),
    createComment: builder.mutation({
      query: ({data, postId}) => ({
        url: `/comments/${postId}`,
        method: 'POST',
        data,
      }),
    }),
    getCommentById: builder.query({
      query: ({postId, commentId}) => ({
        url: `/comments/${postId}/${commentId}`,
        method: 'GET',
      }),
    }),
    updateComment: builder.mutation({
      query: ({ postId, commentId, data }) => ({
        url: `/comments/${postId}/${commentId}`,
        method: 'PUT',
        data,
      }),
    }),
    deleteComment: builder.mutation({
      query: ({postId, commentId}) => ({
        url: `/comments/${postId}/${commentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetCommentByIdQuery,
  useLazyGetCommentByIdQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;

export default commentApi;
