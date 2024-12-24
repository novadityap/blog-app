import { useForm } from 'react-hook-form';
import { useState } from 'react';

const useFormHandler = (mutationFn, token) => {
  const [message, setMessage] = useState('');
  const [mutate, { isLoading, isError, error, isSuccess }] = mutationFn();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async data => {
    try {
      const payload = token ? { data, token } : data;
      const result = await mutate(payload).unwrap();
      setMessage(result.message);
      reset();
    } catch (e) {
      if (e.code !== 400) setMessage(e.message);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  };
};

export default useFormHandler;
