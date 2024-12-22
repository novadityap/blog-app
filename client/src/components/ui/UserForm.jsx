import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormik } from 'formik';
import transformErrors from '@/utils/transformErrors';
import { useLazyListRolesQuery } from '@/services/roleApi';
import { Checkbox } from '@/components/ui/checkbox';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {TbLoader} from 'react-icons/tb';

const UserForm = ({ initialValues, onSubmit, onCancel, isCreate, isLoading }) => {
  const { data: roles } = useLazyListRolesQuery();
  const roleIds = initialValues?.roles?.map(role => role._id);
  const [validationErrors, setValidationErrors] = useState({});
  const formik = useFormik({
    initialValues: {
      avatar: null,
      username: initialValues?.username || '',
      email: initialValues?.email || '',
      password: '',
      roles: roleIds || [],
    },
    enableReinitialize: true,
    onSubmit: values => {
      if (!values.avatar) delete values.avatar;
      
      const { errors } = onSubmit(values);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  const handleAvatarChange = e => formik.setFieldValue('avatar', e.target.files[0]);
  const handleCheckboxChange = roleId => {
    const currentRoles = formik.values.roles;

    const updatedRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    formik.setFieldValue('roles', updatedRoles);
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-80">
      <TbLoader className="size-10 animate-spin" />
    </div>
  );


  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      {!isCreate && (
        <div className='flex items-center gap-x-8'>
          <Avatar className="size-20">
            <AvatarImage src={initialValues?.avatar} />
            <AvatarFallback>
              <TbLoader className="size-5 animate-spin" />
            </AvatarFallback>
          </Avatar>
          <Input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />

          {validationErrors?.avatar && (
            <p className="text-red-500 text-sm">{validationErrors.avatar}</p>
          )}
        </div>
      )}
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.username}
        />

        {validationErrors?.username && (
          <p className="text-red-500 text-sm">{validationErrors.username}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.email}
        />

        {validationErrors?.email && (
          <p className="text-red-500 text-sm">{validationErrors.email}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
        />

        {validationErrors?.password && (
          <p className="text-red-500 text-sm">{validationErrors.password}</p>
        )}
      </div>
      <div>
        <Label htmlFor="roles">Roles</Label>

        {roles?.data?.map(role => (
          <div key={role._id} className='my-2'>
            <div className='flex items-center gap-x-2'>
            <Checkbox
              id={role._id}
              checked={formik.values.roles.includes(role._id)}
              onCheckedChange={() => handleCheckboxChange(role._id)}
            />
            <Label htmlFor={role._id}>{role.name}</Label>
            </div>
          </div>
        ))}

        {validationErrors?.roles && (
          <p className="text-red-500 text-sm">{validationErrors.roles}</p>
        )}
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

export default UserForm;
