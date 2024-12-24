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
import { TbLoader, TbCircleCheck } from 'react-icons/tb';
import useFormHandler from '@/hooks/useFormHandler';
import { useRequestResetPasswordMutation } from '@/services/authApi';
import { cn } from '@/lib/utils';

const RequestResetPassword = () => {
  const {
    register,
    handleSubmit,
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  } = useFormHandler(useRequestResetPasswordMutation);

  return (
    <div className="flex flex-col gap-y-4 items-center justify-center min-h-screen ">
      <Card className="full sm:w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-500">
            Request Reset Password
          </CardTitle>
          <CardDescription>
            Enter your email and we will send you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess && (
            <Alert className="mb-4" variant="success">
              <TbCircleCheck className="size-5 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email" className="text-gray-500">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                {...register('email')}
                required
                placeholder="Enter your email"
                className={cn(isError && 'border-red-200 focus:ring-red-200')}
              />

              {error?.errors?.email && (
                <p className="text-red-500 text-sm">{error.errors.email}</p>
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
                'Send Reset Link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestResetPassword;
