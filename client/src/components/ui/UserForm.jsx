import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { useLazyListRolesQuery } from '@/services/roleApi';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/shadcn/select';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { useEffect } from 'react';
import { TbLoader } from 'react-icons/tb';

const UserForm = ({
  initialValues,
  mutation,
  onComplete,
  onCancel,
  isCreate,
}) => {
  const [fetchRoles, { data: roles }] = useLazyListRolesQuery();
  const { form, handleSubmit, isLoading } = useFormHandler({
    formType: 'datatable',
    ...(!isCreate && {
      params: [{ name: 'userId', value: initialValues._id }],
    }),
    mutation,
    onComplete,
    defaultValues: {
      avatar: '',
      username: initialValues.username ?? '',
      email: initialValues.email ?? '',
      password: '',
      role: initialValues.role?._id ?? '',
    },
  });

  useEffect(() => {
    if (!isCreate) fetchRoles();
  }, [fetchRoles, isCreate]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isCreate && (
          <>
            <div className="flex justify-center">
              <Avatar className="size-32">
                <AvatarImage
                  src={initialValues?.avatar}
                  fallback={
                    <AvatarFallback>{initialValues?.username}</AvatarFallback>
                  }
                />
              </Avatar>
            </div>
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => field.onChange(e.target.files[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={open => open && !roles && fetchRoles()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles?.data?.map(role => (
                    <SelectItem
                      key={role._id}
                      value={role._id}
                      selected={role._id === field.value}
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default UserForm;
