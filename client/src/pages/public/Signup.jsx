import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/shadcn/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/form';
import { TbLoader, TbCircleCheck, TbBrandGoogle } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { useSignupMutation } from '@/services/authApi';
import useFormHandler from '@/hooks/useFormHandler';
import useGoogleSignin from '@/hooks/useGoogleSignin';

const Signup = () => {
  const handleGoogleSignin = useGoogleSignin();
  const { form, handleSubmit, isLoading, isSuccess, message } = useFormHandler({
    mutation: useSignupMutation,
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  return (
    <Card className="w-full sm:w-[450px] my-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-600">
          Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSuccess && (
          <Alert variant="success">
            <TbCircleCheck className="size-5 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <Button
          onClick={handleGoogleSignin}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <TbBrandGoogle size={20} />
          Sign in with Google
        </Button>
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
  );
};

export default Signup;
