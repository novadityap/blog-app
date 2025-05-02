import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setCurrentUser } from '@/features/authSlice';
import { toast } from 'react-hot-toast';

const useFormHandler = ({
  mutation,
  tokens,
  ids,
  isDatatableForm,
  onComplete,
  defaultValues,
  isProfileUpdate = false,
}) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);
  const [message, setMessage] = useState('');
  const [mutate, { isLoading, isError, error, isSuccess }] = mutation();
  const { handleSubmit, ...form } = useForm({ defaultValues });

  const onSubmit = async data => {
    try {
      const payload = tokens
        ? { data, ...tokens }
        : ids
        ? { data, ...ids }
        : data;

      const result = await mutate(payload).unwrap();

      if (result.data?.token) {
        const { token, _id, ...user } = result.data;
        dispatch(setToken(token));
        dispatch(
          setCurrentUser({
            id: _id,
            ...user,
          })
        );
      }

      if (isProfileUpdate && currentUser.id === result.data._id) {
        const { _id, ...user } = result.data;
        dispatch(
          setCurrentUser({
            id: _id,
            role: currentUser.role,
            ...user,
          })
        );
      }

      if (isDatatableForm && onComplete) {
        onComplete(result);
      } else {
        toast.success(result.message);
        setMessage(result.message);
      }

      form.reset(result.data);
    } catch (e) {
      if (e.errors) {
        Object.keys(e.errors).forEach(key => {
          const message = e.errors[key];
          form.setError(key, { type: 'manual', message });
        });
      }

      if (isDatatableForm && e.code !== 400 && e.code !== 409) {
        toast.error(e.message);
      } else {
        setMessage(e.message);
      }
    }
  };

  return {
    form,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  };
};

export default useFormHandler;
