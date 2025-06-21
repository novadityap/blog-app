import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/shadcn-ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/shadcn-ui/card';
import { TbMailX, TbCircleCheck } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { useVerifyEmailMutation } from '@/services/authApi';
import { cn } from '@/lib/utils';

const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const [verifyEmail, { isLoading, isError, isSuccess, error, data }] =
    useVerifyEmailMutation();

  useEffect(() => {
    if (verificationToken) verifyEmail(verificationToken);
  }, [verificationToken, verifyEmail]);

  const message = isError ? error?.message : data?.message;

  if (isLoading) {
    return (
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
  }

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
            <Link
              to={isError ? '/resend-verification' : '/signin'}
              className="w-full"
            >
              <Button className="w-full">
                {isError ? 'Resend Email' : 'Sign In'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default VerifyEmail;
