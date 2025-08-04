'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleSigninMutation } from '@/services/authApi';
import { setToken, setCurrentUser } from '@/lib/features/authSlice';
import { useDispatch } from 'react-redux';
import { TbLoader2 } from 'react-icons/tb';

const GoogleCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [googleSignin] = useGoogleSigninMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return router.replace('/signin');

    googleSignin({ code })
      .unwrap()
      .then(result => {
        dispatch(setToken(result.data.token));
        dispatch(setCurrentUser(result.data));
        router.replace('/');
      })
      .catch(() => router.replace('/signin'));
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white shadow-lg">
        <TbLoader2 className="animate-spin text-primary size-8" />
        <h2 className="text-lg font-medium text-muted-foreground">
          Processing Google signin...
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Please wait a moment. You will be redirected after a successful
          signin.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
