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
import { useFormik } from 'formik';
import useAuth from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { TbLoader, TbExclamationCircle } from 'react-icons/tb';
import { cn } from '@/lib/utils.js';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
  const navigate = useNavigate();
  const { token, handleSignin, isSigninLoading, isSigninError, signinError, validationErrors, message } = useAuth();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: values => handleSignin(values)
  });

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-y-4">
        {isSigninError && signinError?.code === 401 && (
          <Alert className="w-96" variant="destructive">
            <TbExclamationCircle className="size-5 text-red-500" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <Card className="w-full sm:w-[450px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-500">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email" className="text-gray-500">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  required
                  placeholder="Enter your email"
                  className={cn(signinError && 'border-red-200 focus:ring-red-200')}
                />

                {validationErrors?.email && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <Label htmlFor="password" className="text-gray-500">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  required
                  placeholder="Enter your password"
                  className={cn(signinError && 'border-red-200 focus:ring-red-200')}
                />

                {validationErrors?.password && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full "
                disabled={isSigninLoading}
              >
                {isSigninLoading ? (
                  <>
                    <TbLoader className="animate-spin mr-2 size-5" />
                    Loading...
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
