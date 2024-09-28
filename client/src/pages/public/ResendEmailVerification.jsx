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
import { useResendEmailVerificationMutation } from '@/services/authApi';
import { useState } from 'react';
import { TbLoader, TbCircleCheck } from 'react-icons/tb';

const ResendEmailVerification = () => {
  const [resendEmailVerification, { isLoading, isSuccess }] =
    useResendEmailVerificationMutation();
  const [message, setMessage] = useState('');
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await resendEmailVerification(values).unwrap();
        setMessage(res.message);
        resetForm();
      } catch (err) {
        return;
      }
    },
  });

  return (
    <div className="flex flex-col gap-y-4 items-center justify-center min-h-screen ">
      {isSuccess && (
        <Alert className="w-96" variant="success">
          <TbCircleCheck className="size-5 text-green-500" />
          <AlertTitle>Email Sent</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-500">
            Resend Email Verification
          </CardTitle>
          <CardDescription>
            Please enter your email and we will send you a verification link
          </CardDescription>
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
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full "
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <TbLoader className="animate-spin mr-2" size={20} />
                  Loading...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendEmailVerification;
