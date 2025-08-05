'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/shadcn/card';
import { TbMailX, TbCircleCheck } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useVerifyEmailMutation } from '@/services/authApi';
import { cn } from '@/lib/utils';

const VerifyEmailSkeleton = () => (
  <div className="w-full sm:w-[450px]">
    <div className="flex flex-col gap-y-5">
      <Skeleton className="h-56 w-96 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  </div>
);

const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const [verifyEmail, { isLoading, isError, isSuccess, error, data }] =
    useVerifyEmailMutation();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (verificationToken && !hasRequested.current) {
      verifyEmail(verificationToken);
      hasRequested.current = true;
    }
  }, [verificationToken, verifyEmail]);

  const message = isError ? error?.message : data?.message;

  if (isLoading) return <VerifyEmailSkeleton />;

  return (
    <div className="w-full sm:w-[450px]">
      {(isError || isSuccess) && (
        <Card>
          <CardHeader className="text-center">
            {isError ? (
              <TbMailX className="text-red-500 size-28 w-full mb-4" />
            ) : (
              <TbCircleCheck className="text-green-500 size-28 w-full mb-4" />
            )}
            <CardTitle className={cn(isError && 'text-red-500')}>
              {isError ? 'Failed' : 'Success'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={isError ? '/resend-verification' : '/signin'}>
                {isError ? 'Resend Email' : 'Sign In'}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default VerifyEmail;
