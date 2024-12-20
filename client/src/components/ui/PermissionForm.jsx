import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormik } from 'formik';
import transformErrors from '@/utils/transformErrors';

const PermissionForm = ({ initialValues, onSubmit, onCancel, isCreate }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const formik = useFormik({
    initialValues: {
      action: initialValues?.action || '',
      resource: initialValues?.resource || '',
      description: initialValues?.description || '',
    },
    enableReinitialize: true,
    onSubmit: async values => {
      const { errors} =  await onSubmit(values);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div>
        <Label htmlFor="action">Action</Label>
        <Select
          id="action"
          name="action"
          value={formik.values.action}
          onValueChange={value => formik.setFieldValue('action', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>

        {validationErrors?.action && (
          <p className="text-red-500 text-sm">{validationErrors?.action}</p>
        )}
      </div>

      <div>
        <Label htmlFor="resource">Resource</Label>
        <Select
          id="resource"
          name="resource"
          value={formik.values.resource}
          onValueChange={value => formik.setFieldValue('resource', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="permission">Permission</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="dashboard">Dashboard</SelectItem>
          </SelectContent>
        </Select>

        {validationErrors?.resource && (
          <p className="text-red-500 text-sm">{validationErrors?.resource}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          placeholder="Enter description"
        />

        {validationErrors?.description && (
          <p className="text-red-500 text-sm">{validationErrors?.description}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button  type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
      </div>
    </form>
  );
};

export default PermissionForm;
