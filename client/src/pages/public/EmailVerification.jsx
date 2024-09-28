import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmailVerificationMutation } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { TbMailX, TbCircleCheck } from 'react-icons/tb';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const EmailVerification = () => {
  const { token } = useParams();
  const [emailVerification, { isLoading, isError, isSuccess }] =
    useEmailVerificationMutation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await emailVerification(token).unwrap();
        setMessage(res?.message);
      } catch (err) {
        setMessage(err?.message);
      }
    })();
  }, [token, emailVerification]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isLoading && (
        <div className="flex flex-col gap-y-5">
          <Skeleton className="h-56 w-96 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      )}

      {(isError || isSuccess) && (
        <Card className="w-96">
          <CardHeader>
            {isError ? (
              <TbMailX className="text-red-500 size-32 w-full text-center mb-4" />
            ) : (
              <TbCircleCheck className="text-green-500 size-32 w-full text-center mb-4" />
            )}
            <CardTitle className="text-gray-500">
              {isError ? 'Email Verification Failed' : 'Email Verified'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to={isError ? '/resend-email-verification' : '/signin'}
              className="w-full"
            >
              <Button variant="primary" className="w-full">
                {isError ? 'Resend Email' : 'Sign In'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default EmailVerification;
