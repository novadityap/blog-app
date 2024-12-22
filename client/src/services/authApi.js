import axiosBaseQuery from '@/app/baseQuery.js';
import { createApi } from '@reduxjs/toolkit/query/react';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    signup: builder.mutation({
      query: data => ({
        url: '/auth/signup',
        method: 'POST',
        data,
      }),
    }),
    signin: builder.mutation({
      query: data => ({
        url: '/auth/signin',
        method: 'POST',
        data,
      }),
    }),
    signout: builder.mutation({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
    verifyEmail: builder.mutation({
      query: token => ({
        url: `/auth/verify-email/${token}`,
        method: 'POST',
      }),
    }),
    resendVerification: builder.mutation({
      query: data => ({
        url: '/auth/resend-verification',
        method: 'POST',
        data,
      }),
    }),
    requestResetPassword: builder.mutation({
      query: data => ({
        url: '/auth/request-reset-password',
        method: 'POST',
        data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({data, token}) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { 
  useSignupMutation,
  useSigninMutation,
  useSignoutMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation
} = authApi;

export default authApi;
