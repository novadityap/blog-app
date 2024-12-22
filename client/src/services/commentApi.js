import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/baseQuery';

const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    searchComments: builder.query({
      query: (params = {}) => ({
        url: '/comments',
        method: 'GET',
        params,
      }),
    }),
    createComment: builder.mutation({
      query: ({data, postId, commentId}) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'POST',
        data,
      }),
    }),
    showComment: builder.query({
      query: ({postId, commentId}) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'GET',
      }),
    }),
    updateComment: builder.mutation({
      query: ({ postId, commentId, data }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'PUT',
        data,
      }),
    }),
    removeComment: builder.mutation({
      query: ({postId, commentId}) => ({
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
  useUpdateCommentMutation,
  useRemoveCommentMutation,
} = commentApi;

export default commentApi;
