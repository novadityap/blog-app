import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { TbLoader, TbCircleCheck } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSignupMutation } from '@/services/authApi';
import useFormHandler from '@/hooks/useFormHandler';

const Signup = () => {
  const {
    register,
    handleSubmit,
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  } = useFormHandler(useSignupMutation);

  return (
    <div className="flex flex-col gap-y-4 items-center justify-center min-h-screen ">
      <Card className="w-full sm:w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-500">
            Sign Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess && (
            <Alert variant="success" className="mb-4">
              <TbCircleCheck className="size-5 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="username" className="text-gray-500">
                Username
              </Label>
              <Input
                type="username"
                id="username"
                {...register('username')}
                required
                placeholder="Enter your username"
                className={cn(isError && 'border-red-200 focus:ring-red-200')}
              />

              {error?.errors?.username && (
                <p className="text-red-500 text-sm">{error.errors.username}</p>
              )}
            </div>

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

            <div className="mb-4">
              <Label htmlFor="password" className="text-gray-500">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                {...register('password')}
                required
                placeholder="Enter your password"
                className={cn(isError && 'border-red-200 focus:ring-red-200')}
              />

              {error?.errors?.password && (
                <p className="text-red-500 text-sm">{error.errors.password}</p>
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
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="flex items-center justify-betweens gap-1">
            <p className="text-gray-500 text-sm">Have an account?</p>
            <Link
              to="/signin"
              className="text-sm text-gray-500 hover:underline hover:text-blue-600"
            >
              Sign In
            </Link>
          </div>
          <Link
            to="/request-reset-password"
            className="text-sm text-gray-500 hover:underline hover:text-blue-600"
          >
            Forgot Password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
