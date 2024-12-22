import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormik } from 'formik';
import transformErrors from '@/utils/transformErrors';
import { useListPermissionsQuery } from '@/services/permissionApi';
 
const RoleForm = ({ initialValues, onSubmit, onCancel, isCreate }) => {
  const { data: permissionsData } = useListPermissionsQuery();
  const [validationErrors, setValidationErrors] = useState({});

  const permissionIds = initialValues?.permissions?.map(permission => permission._id) || [];
  
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      permissions: permissionIds || [],
    },
    enableReinitialize: true,
    onSubmit: async formValues => {
      const { errors } = await onSubmit(formValues);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  const groupedPermissions = permissionsData?.data?.reduce((acc, permission) => {
    const { resource, _id, action } = permission;
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push({ _id, action });
    acc[resource].sort((a, b) => a.action.localeCompare(b.action));
    return acc;
  }, {}) || {};

  const handleCheckboxChange = permissionId => {
    const currentPermissions = formik.values.permissions;
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];

    formik.setFieldValue('permissions', updatedPermissions);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          {validationErrors?.name && (
            <p className="text-red-500 text-sm">{validationErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-y-5">
          {Object.keys(groupedPermissions).map(resource => (
            <div key={resource} className="space-y-3">
              <span className="text-gray-600 font-semibold">{resource}</span>
              {groupedPermissions[resource].map(permission => (
                <div className="flex items-center gap-x-3" key={permission._id}>
                  <Checkbox
                    id={permission._id}
                    checked={formik.values.permissions.includes(permission._id)}
                    onCheckedChange={() => handleCheckboxChange(permission._id)}
                  />
                  <Label htmlFor={permission._id}>{permission.action}</Label>
                </div>
              ))}
            </div>
          ))}
          {validationErrors?.permissions && (
            <p className="text-red-500 text-sm">{validationErrors.permissions}</p>
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

export default RoleForm;
