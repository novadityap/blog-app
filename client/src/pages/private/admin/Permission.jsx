import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useGetPermissionsQuery,
  useLazyGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from '@/services/permissionApi';
import PermissionForm from '@/components/ui/PermissionForm';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';

const Permission = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('action', {
      header: 'Action',
      size: 60,
    }),
    columnsHelper.accessor('resource', {
      header: 'Resource',
      size: 60,
    }),
    columnsHelper.accessor('description', {
      header: 'Description',
      size: 150,
    }),
  ];

  return (
      <>
        <BreadcrumbNav />
        <h1 className="mb-4 text-2xl font-semibold">Permissions</h1>
      
      <DataTable 
        columns={columns} 
        useGetQuery={useGetPermissionsQuery}
        useLazyGetByIdQuery={useLazyGetPermissionByIdQuery}
        useCreateMutation={useCreatePermissionMutation}
        useUpdateMutation={useUpdatePermissionMutation}
        useDeleteMutation={useDeletePermissionMutation}
        FormComponent={PermissionForm}
      />
      </>

  );
};
export default Permission;
