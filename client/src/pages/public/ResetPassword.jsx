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
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import { TbLoader, TbExclamationCircle, TbCircleCheck } from 'react-icons/tb';
import { cn } from '@/lib/utils.js';
import useAuth from '@/hooks/useAuth';

const ResetPassword = () => {
  const { token } = useParams();
  const { handleResetPassword, isResetPasswordLoading, isResetPasswordSuccess, isResetPasswordError, resetPasswordError, message, validationErrors } = useAuth();
  const formik = useFormik({
    initialValues: {
      newPassword: '',
    },
    onSubmit: (values, { resetForm }) => handleResetPassword(values, resetForm, token),
  });

  const isInvalidToken = isResetPasswordError && resetPasswordError.code === 401;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {(isInvalidToken || isResetPasswordSuccess) && (
        <Alert
          className="mb-4 w-96"
          variant={isResetPasswordError ? 'destructive' : 'success'}
        >
          {isResetPasswordError ? (
            <TbExclamationCircle className="size-5 text-red-500" />
          ) : (
            <TbCircleCheck className="size-5 text-green-500" />
          )}
          <AlertTitle>
            {isResetPasswordError ? 'Something went wrong' : 'Success'}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Card className="w-96">
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
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="newPassword" className="text-gray-500">
                New Password
              </Label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                required
                placeholder="Enter your new password"
                className={cn(
                  isResetPasswordError &&
                    resetPasswordError.code === 400 &&
                    'border-red-200 focus:ring-red-200'
                )}
              />

              {validationErrors?.newPassword && (
                <p className="text-red-500">{validationErrors.newPassword}</p>
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full "
              disabled={isResetPasswordLoading}
            >
              {isResetPasswordLoading ? (
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
