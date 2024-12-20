import { useFormik } from 'formik';
import { useState } from 'react';
import transformErrors from '@/utils/transformErrors';
import { Input } from '@/components/ui/input.jsx';
import {Button} from '@/components/ui/button.jsx'

const CategoryForm = ({ initialValues, onSubmit, onCancel, isCreate }) => {
  const [validationErrors, setValidationErrors] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const {errors} = onSubmit(values);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name">Category Name</label>
        <Input
          id="name"
          name="name"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.name}
          placeholder="Enter category name"
        />
        
        {
          validationErrors?.name && (
            <div className="text-red-500 text-sm">{validationErrors.name}</div>
          )
        }
      </div>

      <div className="flex justify-end space-x-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
        </div>
    </form>
  );
};

export default CategoryForm;
