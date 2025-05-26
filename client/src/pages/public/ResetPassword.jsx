import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/shadcn-ui/alert.jsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/shadcn-ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn-ui/form';
import { useParams, Link } from 'react-router-dom';
import { TbLoader, TbExclamationCircle, TbCircleCheck } from 'react-icons/tb';
import useFormHandler from '@/hooks/useFormHandler';
import { useResetPasswordMutation } from '@/services/authApi';
import { cn } from '@/lib/utils';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const { form, handleSubmit, isLoading, error, isSuccess, message } =
    useFormHandler({
      mutation: useResetPasswordMutation,
      params: [{name: 'resetToken', value: resetToken}],
      defaultValues: {
        newPassword: '',
      },
    });

  return (
    <Card className="w-full sm:w-[450px]">
      <CardHeader>
        <CardTitle className="text-gray-600">Reset Password</CardTitle>
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
                to={isSuccess ? '/signin' : '/request-reset-password'}
                className={cn(
                  'hover:underline font-semibold',
                  !isSuccess && 'text-red-500'
                )}
              >
                {isSuccess
                  ? 'Click here to sign in'
                  : 'Click here to request a new link'}
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
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
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
