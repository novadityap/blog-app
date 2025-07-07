import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useSearchUsersQuery,
  useRemoveUserMutation,
} from '@/services/userApi.js';
import UserForm from '@/components/ui/UserForm.jsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import { Badge } from '@/components/shadcn/badge';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';

const User = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('avatar', {
      header: 'Avatar',
      size: 60,
      cell: info => (
        <Avatar>
          <AvatarImage src={info.getValue()} />
          <AvatarFallback>
            {info.getValue().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    }),
    columnsHelper.accessor('username', {
      header: 'Username',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('role', {
      header: 'Role',
      size: 60,
      cell: info => {
        const role = info.getValue();
        if (role.name === 'admin')
          return <Badge variant="destructive">Admin</Badge>;
        if (role.name === 'user') return <Badge variant="primary">User</Badge>;
      },
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-600">Users</CardTitle>
          <CardDescription>Manage users</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchUsersQuery}
            removeMutation={useRemoveUserMutation}
            FormComponent={UserForm}
            entityName='user'
          />
        </CardContent>
      </Card>
    </>
  );
};
export default User;
