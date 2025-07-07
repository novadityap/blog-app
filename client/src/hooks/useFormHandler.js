import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  setToken,
  setCurrentUser,
  updateCurrentUser,
} from '@/features/authSlice';
import { toast } from 'react-hot-toast';

const getChangedData = (dirtyFields, form) => {
  return Object.fromEntries(
    Object.keys(dirtyFields).map(key => [key, form.getValues(key)])
  );
};

const sanitizeNull = data => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value ?? ''])
  );
};

const filterEmptyValues = data => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== '')
  );
};


const buildFormData = ({ data, fileFieldname, isMultiple, method }) => {
  const formData = new FormData();

  if (method) formData.append('_method', method.toUpperCase());

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (isMultiple && key === fileFieldname) {
      value.forEach(file => formData.append(`${key}`, file));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

const buildPayload = (data, params) => {
  return params?.length
    ? {
        data,
        ...Object.fromEntries(params.map(({ name, value }) => [name, value])),
      }
    : data;
};

const useFormHandler = ({
  page,
  method,
  mutation,
  fileFieldname,
  defaultValues,
  onSubmitComplete,
  params = [],
  isMultiple = false,
  isCreate = true,
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [mutate, { isLoading, isError, error, isSuccess }] = mutation();
  const form = useForm({ defaultValues });
  const {
    handleSubmit,
    formState: { dirtyFields },
  } = form;

  const onSubmit = async data => {
    try {
      if (!isCreate) {
        data = getChangedData(dirtyFields, form);
      } else {
        data = filterEmptyValues(data);
      }

      if (fileFieldname) {
        data = buildFormData({
          data,
          fileFieldname,
          isMultiple,
          method,
        });
      }

      const result = await mutate(buildPayload(data, params)).unwrap();

      if (page === 'signin') {
        dispatch(setToken(result.data.token));
        dispatch(setCurrentUser(result.data));
      }
      if (page === 'profile') dispatch(updateCurrentUser(result.data));
      if (onSubmitComplete) onSubmitComplete();

      toast.success(result.message);
      setMessage(result.message);

      form.reset(sanitizeNull(result.data));
    } catch (e) {
      if (e.errors) {
        Object.keys(e.errors).forEach(key => {
          const message = e.errors[key];
          form.setError(key, { type: 'manual', message });
        });
      }

      if (e.code !== 400) {
        toast.error(e.message);
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
