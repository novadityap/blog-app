import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormik } from 'formik';
import transformErrors from '@/utils/transformErrors';

const UserForm = ({ initialValues, onSubmit, onCancel, isCreate }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const formik = useFormik({
    initialValues: {
      content: initialValues?.content || '',
    },
    enableReinitialize: true,
    onSubmit: async formValues => {
      const { errors } = await onSubmit(formValues);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <div>
          <Label htmlFor="content">Content</Label>
          <Input
            id="content"
            name="content"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.content}
          />

          {validationErrors?.content && (
            <p className="text-red-500 text-sm">{validationErrors.content}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
