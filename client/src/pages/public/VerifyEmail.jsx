import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import useAuth from '@/hooks/useAuth';

const VerifyEmail = () => {
  const { token } = useParams();
  const { handleVerifyEmail, isVerificationLoading, isVerificationError, isVerificationSuccess, message } = useAuth();

  useEffect(() => {
    handleVerifyEmail(token);
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isVerificationLoading && (
        <div className="flex flex-col gap-y-5">
          <Skeleton className="h-56 w-96 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      )}

      {(isVerificationError || isVerificationSuccess) && (
        <Card className="w-96">
          <CardHeader>
            {isVerificationError ? (
              <TbMailX className="text-red-500 size-32 w-full text-center mb-4" />
            ) : (
              <TbCircleCheck className="text-green-500 size-32 w-full text-center mb-4" />
            )}
            <CardTitle className="text-gray-500">
              {isVerificationError ? 'Email Verification Failed' : 'Email Verified'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to={isVerificationError ? '/resend-email-verification' : '/signin'}
              className="w-full"
            >
              <Button variant="primary" className="w-full">
                {isVerificationError ? 'Resend Email' : 'Sign In'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default VerifyEmail;
