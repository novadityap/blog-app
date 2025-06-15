import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setCurrentUser, updateCurrentUser } from '@/features/authSlice';
import { toast } from 'react-hot-toast';

const useFormHandler = ({
  mutation,
  params = [],
  formType,
  onComplete,
  defaultValues,
  isCreate = true
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [mutate, { isLoading, isError, error, isSuccess }] = mutation();
  const { 
    handleSubmit, 
    formState: { dirtyFields },
    ...form 
  } = useForm({ defaultValues });

  const buildPayload = ({ data, changedData = {}, params = [] }) => {
    let payload = {};

    if (params.length > 0) {
      const paramPayload = params.reduce((acc, { name, value }) => {
        if (name && value !== undefined) acc[name] = value;
        return acc;
      }, {});

      payload = {
        data: Object.keys(changedData).length > 0 ? changedData : data,
        ...paramPayload,
      };

      return payload;
    } else {
      payload = Object.keys(changedData).length > 0 ? changedData : data;
      return payload;
    }
  };

  const onSubmit = async data => {
    try {
       const changedData = !isCreate ? Object.keys(dirtyFields).reduce((acc, key) => {
        acc[key] = form.getValues(key);
        return acc;
      }, {}) : {};

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, v]) =>
            v !== '' &&
          v !== null &&
          v !== undefined &&
          !(Array.isArray(v) && v.length === 0)
        )
      );
      const payload = buildPayload({
        data: filteredData,
        changedData,
        params,
      });
      const result = await mutate(payload).unwrap();

      if (formType === 'signin') {
        dispatch(setToken(result.data.token));
        dispatch(setCurrentUser(result.data));
      }

      if (formType === 'profile') {
        dispatch(updateCurrentUser(result.data));
      }

      if (formType === 'datatable' && onComplete) {
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

      if (formType === 'datatable' && e.code !== 400) {
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
