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
import { useSigninMutation } from '@/services/authApi';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { TbLoader, TbExclamationCircle } from 'react-icons/tb';
import { cn } from '@/lib/utils.js';
import useFormHandler from '@/hooks/useFormHandler';

const Signin = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const {
    register,
    handleSubmit,
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  } = useFormHandler(useSigninMutation);

  useEffect(() => {
    if (token || isSuccess) navigate('/');
  }, [token, isSuccess, navigate]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-y-4">
        <Card className="w-full sm:w-[450px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-500">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error?.code === 401 && (
              <Alert className="mb-4" variant="destructive">
                <TbExclamationCircle className="size-5 text-red-500" />
                <AlertTitle>Something went wrong</AlertTitle>
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
                  <p className="text-red-500 text-sm">
                    {error.errors.password}
                  </p>
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <div className="flex items-center justify-betweens gap-2">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?
              </p>
              <Link
                to="/signup"
                className="text-sm text-gray-500 hover:underline hover:text-blue-600"
              >
                Sign Up
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
  }
};

export default Signin;
