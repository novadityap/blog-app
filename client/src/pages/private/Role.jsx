import { createColumnHelper } from '@tanstack/react-table';
import DataTable from '@/components/ui/DataTable';
import {
  useSearchRolesQuery,
  useLazyShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} from '@/services/roleApi';
import RoleForm from '@/components/ui/RoleForm';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';

const Role = () => {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-600">Roles</CardTitle>
          <CardDescription>Manage roles</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchRolesQuery}
            lazyShowQuery={useLazyShowRoleQuery}
            createMutation={useCreateRoleMutation}
            updateMutation={useUpdateRoleMutation}
            removeMutation={useRemoveRoleMutation}
            FormComponent={RoleForm}
          />
        </CardContent>
      </Card>
    </>
  );
};
export default Role;
