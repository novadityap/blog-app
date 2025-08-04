'use client'

import { useSelector } from 'react-redux';
import {useEffect} from 'react';
import { useRouter } from 'next/navigation';

const AuthGuard = ({ requiredRoles, children }) => {
  const router = useRouter();
  const { token, currentUser } = useSelector(state => state.auth);

  useEffect(() => {
    if (!token) {
      router.replace('/');
    } else if (!requiredRoles.includes(currentUser?.role)) {
      router.replace('/unauthorized');
    }
  }, [token, currentUser, requiredRoles, router]);

  return <>{children}</>;
};

export default AuthGuard;
