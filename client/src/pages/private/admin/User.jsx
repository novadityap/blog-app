import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useGetUsersQuery,
  useLazyGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/services/userApi.js';
import UserForm from '@/components/ui/UserForm.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TbLoader } from 'react-icons/tb';
import { Badge } from '@/components/ui/badge';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';

const User = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('avatar', {
      header: 'Avatar',
      cell: info => (
        <Avatar>
          <AvatarImage src={info.getValue()} />
          <AvatarFallback>
            <TbLoader />
          </AvatarFallback>
        </Avatar>
      ),
      size: 60,
    }),
    columnsHelper.accessor('username', {
      header: 'Username',
      size: 60,
    }),
    columnsHelper.accessor('email', {
      header: 'Email',
      size: 60,
    }),
    columnsHelper.accessor('roles', {
      header: 'Roles',
      size: 60,
      cell: info => {
        const roles = info.getValue();

        return roles.map(role => {
          return (
            <div key={role._id} className="flex justify-center mb-2">
              {role.name === 'admin' ? (
                <Badge key={role._id} variant="primary">
                  {role.name}
                </Badge>
              ) : (
                <Badge key={role._id} variant="destructive">
                  {role.name}
                </Badge>
              )}
            </div>
          );
        });
      },
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>

      <DataTable
        columns={columns}
        useGetQuery={useGetUsersQuery}
        useLazyGetByIdQuery={useLazyGetUserByIdQuery}
        useCreateMutation={useCreateUserMutation}
        useUpdateMutation={useUpdateUserMutation}
        useDeleteMutation={useDeleteUserMutation}
        FormComponent={UserForm}
      />
    </>
  );
};
export default User;
