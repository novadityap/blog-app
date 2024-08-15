/* eslint-disable react/no-unescaped-entities */
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { Label, TextInput, Button, Spinner, Alert } from 'flowbite-react';
import { TbBrandGoogle } from 'react-icons/tb';
import { useSignupMutation } from '../services/authApi';
import { useState } from 'react';
import changeErrorToObject from '../utils/changeErrorToObject.js';

const SignUp = () => {
  const [signup, { isLoading, isSuccess }] = useSignupMutation();
  const [validationError, setValidationError] = useState(null);
  const [message, setMessage] = useState(null);
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: values => {
      signup(values)
        .unwrap()
        .then(res => {
          setMessage(res.message);
          formik.resetForm();
          setValidationError(null);
        })
        .catch(err => {
          setValidationError(changeErrorToObject(err.data.error));
        });
    },
  });

  return (
    <div className="mx-auto px-2 my-14 sm:w-96 md:w-3/4 lg:w-1/2 grid md:grid-cols-2">
      <div className="text-left place-self-center mr-4">
        <div className="text-3xl font-semibold">
          <span className="px-3 py-1 mr-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            Aditya's
          </span>
          <span>Blog</span>
        </div>
        <p className="mt-3 mb-8">
          This is a demo project. You can signup with your email and password or
          with Google.
        </p>
      </div>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-y-4">
        {isSuccess && (
          <Alert color="success" className="place-self-center">
            {message}
          </Alert>
        )}
        <div>
          <Label htmlFor="username" value="Username" className="block mb-2" />
          <TextInput
            id="username"
            name="username"
            type="text"
            required
            onChange={formik.handleChange}
            value={formik.values.username}
            color={validationError?.username && 'failure'}
            helperText={
              validationError?.username && (
                <span>{validationError?.username}</span>
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="email" value="Email" className="block mb-2" />
          <TextInput
            id="email"
            name="email"
            type="email"
            required
            onChange={formik.handleChange}
            value={formik.values.email}
            color={validationError?.email && 'failure'}
            helperText={
              validationError?.email && <span>{validationError?.email}</span>
            }
          />
        </div>
        <div>
          <Label htmlFor="password" value="Password" className="block mb-2" />
          <TextInput
            id="password"
            name="password"
            type="password"
            required
            onChange={formik.handleChange}
            value={formik.values.password}
            color={validationError?.password && 'failure'}
            helperText={
              validationError?.password && (
                <span>{validationError?.password}</span>
              )
            }
          />
        </div>
        <Button gradientDuoTone="purpleToPink" type="submit" className="w-full">
          <span className="flex items-center justify-center gap-x-2">
            <span>{isLoading && <Spinner size="md" />}</span>
            <span>{isLoading ? 'Loading...' : 'Sign Up'}</span>
          </span>
        </Button>
        <Button outline gradientDuoTone="purpleToPink" className="w-full">
          <TbBrandGoogle className="mr-2 size-5" />
          Continue with Google
        </Button>
        <p>Already have an account? <Link to="/signin" className="text-blue-500">Sign In</Link></p>
      </form>
    </div>
  );
};

export default SignUp;
