import {
  useSigninMutation,
  useSignupMutation,
  useSignoutMutation,
  useEmailVerificationMutation,
  useResendEmailVerificationMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation,
} from '@/services/authApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import transformErrors from '@/utils/transformErrors';
import {
  setToken,
  setCurrentUser,
  setRoles,
  setPermissions,
  clearAuth,
} from '@/features/authSlice';
import { useState } from 'react';

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [
    signin,
    {
      isLoading: isSigninLoading,
      isSuccess: isSigninSuccess,
      isError: isSigninError,
      error: signinError,
    },
  ] = useSigninMutation();
  const [
    signup,
    {
      isLoading: isSignupLoading,
      isSuccess: isSignupSuccess,
      isError: isSignupError,
      error: signupError,
    },
  ] = useSignupMutation();
  const [
    signout,
    {
      isLoading: isSignoutLoading,
      isSuccess: isSignoutSuccess,
      isError: isSignoutError,
      error: signoutError,
    },
  ] = useSignoutMutation();
  const [
    emailVerification,
    {
      isLoading: isVerificationLoading,
      isSuccess: isVerificationSuccess,
      isError: isVerificationError,
      error: verificationError,
    },
  ] = useEmailVerificationMutation();
  const [
    resendEmailVerification,
    {
      isLoading: isResendVerificationLoading,
      isSuccess: isResendVerificationSuccess,
      isError: isResendVerificationError,
      error: resendVerificationError,
    },
  ] = useResendEmailVerificationMutation();
  const [
    requestResetPassword,
    {
      isLoading: isRequestResetLoading,
      isSuccess: isRequestResetSuccess,
      isError: isRequestResetError,
      error: requestResetError,
    },
  ] = useRequestResetPasswordMutation();
  const [
    resetPassword,
    {
      isLoading: isResetPasswordLoading,
      isSuccess: isResetPasswordSuccess,
      isError: isResetPasswordError,
      error: resetPasswordError,
    },
  ] = useResetPasswordMutation();
  const { token, currentUser, roles, permissions } = useSelector(
    state => state.auth
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleRequestResetPassword = async (values, resetForm) => {
    try {
      const res = await requestResetPassword(values).unwrap();
      setValidationErrors({});
      setMessage(res.message);
      resetForm();
    } catch (err) {
      setValidationErrors(transformErrors(err.errors));
    }
  };

  const handleResetPassword = async (values, resetForm, tokenParams) => {
    try {
      const res = await resetPassword({
        data: values,
        token: tokenParams,
      }).unwrap();
      setValidationErrors({});
      setMessage(res.message);
      resetForm();
    } catch (err) {
      resetForm();

      if (err.code === 401) {
        setMessage(err.message);
        setValidationErrors({});
        return;
      }

      setMessage('');
      setValidationErrors(transformErrors(err.errors));
    }
  };

  const handleEmailVerification = async tokenParams => {
    try {
      const res = await emailVerification(tokenParams).unwrap();
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleResendEmailVerification = async (values, resetForm) => {
    try {
      const res = await resendEmailVerification(values).unwrap();
      setValidationErrors({});
      setMessage(res.message);
      resetForm();
    } catch (err) {
      setValidationErrors(transformErrors(err.errors));
    }
  };

  const handleSignout = async () => {
    try {
      await signout().unwrap();
      dispatch(clearAuth());
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSignin = async values => {
    try {
      const res = await signin(values).unwrap();
      dispatch(setToken(res.data.token));
      dispatch(
        setCurrentUser({
          id: res.data._id,
          username: res.data.username,
          email: res.data.email,
          avatar: res.data.avatar,
        })
      );
      dispatch(setRoles(res.data.roles));
      dispatch(setPermissions(res.data.permissions));
      navigate('/');
    } catch (err) {
      if (err.code === 401) {
        setMessage(err.message);
        return;
      }

      setValidationErrors(transformErrors(err.errors));
    }
  };

  const handleSignup = async (values, resetForm) => {
    try {
      const res = await signup(values).unwrap();
      setMessage(res.message);
      setValidationErrors({});
      resetForm();
    } catch (err) {
      setValidationErrors(transformErrors(err.errors));
    }
  };

  return {
    token,
    currentUser,
    roles,
    permissions,
    validationErrors,
    message,
    isSigninLoading,
    isSigninSuccess,
    isSigninError,
    signinError,
    isSignupLoading,
    isSignupSuccess,
    isSignupError,
    signupError,
    isSignoutLoading,
    isSignoutSuccess,
    isSignoutError,
    signoutError,
    isVerificationLoading,
    isVerificationSuccess,
    isVerificationError,
    verificationError,
    isResendVerificationLoading,
    isResendVerificationSuccess,
    isResendVerificationError,
    resendVerificationError,
    isRequestResetLoading,
    isRequestResetSuccess,
    isRequestResetError,
    requestResetError,
    isResetPasswordLoading,
    isResetPasswordSuccess,
    isResetPasswordError,
    resetPasswordError,
    handleRequestResetPassword,
    handleResetPassword,
    handleResendEmailVerification,
    handleEmailVerification,
    handleSignup,
    handleSignout,
    handleSignin,
  };
};

export default useAuth;
