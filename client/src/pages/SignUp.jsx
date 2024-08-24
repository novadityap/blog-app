/* eslint-disable react/no-unescaped-entities */
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { Label, TextInput, Button, Spinner, Alert } from 'flowbite-react';
import { useSignupMutation } from '../services/authApi';
import { useState } from 'react';
import changeErrorToObject from '../utils/changeErrorToObject.js';

const SignUp = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const [validationMessage, setValidationMessage] = useState(null);
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
          setValidationMessage(null);
        })
        .catch(err => {
          setValidationMessage(changeErrorToObject(err.data.error));
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
          This is a demo project. You can signup with your email and password
        </p>
      </div>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-y-4">
        {message && (
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
            color={validationMessage?.username && 'failure'}
            helperText={
              validationMessage?.username && (
                <span>{validationMessage?.username}</span>
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
            color={validationMessage?.email && 'failure'}
            helperText={
              validationMessage?.email && (
                <span>{validationMessage?.email}</span>
              )
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
            color={validationMessage?.password && 'failure'}
            helperText={
              validationMessage?.password && (
                <span>{validationMessage?.password}</span>
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
        <p>
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-500">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
