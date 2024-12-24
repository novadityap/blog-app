import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useParams, Link } from 'react-router-dom';
import { TbLoader, TbExclamationCircle, TbCircleCheck } from 'react-icons/tb';
import { cn } from '@/lib/utils.js';
import useFormHandler from '@/hooks/useFormHandler';
import { useResetPasswordMutation } from '@/services/authApi';

const ResetPassword = () => {
  const { token } = useParams();
  const { register, handleSubmit, isLoading, error, isSuccess, message } =
    useFormHandler(useResetPasswordMutation, token);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <Card className="w-full sm:w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-500">
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your new password. Make sure it&apos;s at least 6 characters
            long
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error?.code === 401 || isSuccess) && (
            <Alert
              className="mb-4"
              variant={isSuccess ? 'success' : 'destructive'}
            >
              {isSuccess ? (
                <TbCircleCheck className="size-5 text-green-500" />
              ) : (
                <TbExclamationCircle className="size-5 text-red-500" />
              )}
              <AlertTitle>
                {isSuccess ? 'success' : 'Something went wrong'}
              </AlertTitle>
              <AlertDescription>
                {message}.{' '}
                <Link
                  to="/request-reset-password"
                  className="underline hover:text-primary"
                >
                  Click here to request a new link
                </Link>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="newPassword" className="text-gray-500">
                New Password
              </Label>
              <Input
                type="password"
                id="newPassword"
                {...register('newPassword')}
                required
                placeholder="Enter your new password"
                className={cn(
                  error?.code === 400 && 'border-red-200 focus:ring-red-200'
                )}
              />
              {error?.errors?.newPassword && (
                <p className="text-red-500">{error.errors.newPassword}</p>
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full "
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <TbLoader className="animate-spin mr-2 size-5" />
                  Loading...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
