/* eslint-disable react/no-unescaped-entities */
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { Label, TextInput, Button, Spinner, Alert } from 'flowbite-react';
import { useSigninMutation } from '../services/authApi';
import { useState } from 'react';
import changeErrorToObject from '../utils/changeErrorToObject.js';
import { useDispatch } from 'react-redux';
import { setToken } from '../features/authSlice.js';

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signin, { isLoading, isError }] = useSigninMutation();
  const [validationMessage, setValidationMessage] = useState(null);
  const [message, setMessage] = useState(null);
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: values => {
      signin(values)
        .unwrap()
        .then(res => {
          dispatch(setToken(res.token));
          navigate('/home');
        })
        .catch(err => {
          console.log(err);
          if (err.status === 401) {
            setMessage(err.data.error);
            return;
          }

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
          This is a demo project. You can signin with your email and password
        </p>
      </div>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-y-4">
        {message && (
          <Alert color="failure" className="place-self-center w-full">
            {message}
          </Alert>
        )}
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
            <span>{isLoading ? 'Loading...' : 'Sign In'}</span>
          </span>
        </Button>
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
