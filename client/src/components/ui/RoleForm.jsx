'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { TbLoader } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  useShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from '@/services/roleApi';
import {useEffect } from 'react';

const RoleFormSkeleton = () => (
  <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" /> 
        <Skeleton className="h-10 w-full rounded-md" /> 
      </div>
      <div className="flex justify-end gap-x-2">
        <Skeleton className="h-10 w-24 rounded-md" /> 
        <Skeleton className="h-10 w-24 rounded-md" /> 
      </div>
    </div>
);

const RoleForm = ({onSubmitComplete, onCancel, isCreate, id}) => {
  const { data: role, isLoading: isRoleLoading } = useShowRoleQuery(id, {
    skip: isCreate || !id
  });
  const { form, handleSubmit, isLoading } = useFormHandler({
    formType: 'datatable',
    isCreate,
    mutation: isCreate ? useCreateRoleMutation : useUpdateRoleMutation,
    onSubmitComplete,
    defaultValues: {
      name: '',
    },
    ...(!isCreate && { params: [{ name: 'roleId', value: id }] }),
  });

  useEffect(() => {
      if (!isCreate && role?.data) form.reset({ name: role.data.name });
  }, [role]);

  if (isRoleLoading) return <RoleFormSkeleton />;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <TbLoader className="animate-spin" />
                {isCreate ? 'Creating..' : 'Updating..'}
              </>
            ) : isCreate ? (
              'Create'
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
