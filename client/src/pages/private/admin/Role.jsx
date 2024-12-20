import { createColumnHelper } from "@tanstack/react-table"
import DataTable from "@/components/ui/DataTable"
import { 
  useGetRolesQuery,
  useLazyGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation
 } from "@/services/roleApi"
import RoleForm from "@/components/ui/RoleForm"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"

const Role = () => {
  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 250
    })
  ]

  return (
    <>
      <BreadcrumbNav />
      <h1 className="mb-4 text-2xl font-semibold">Roles</h1>
      <DataTable 
        columns={columns} 
        useGetQuery={useGetRolesQuery}
        useLazyGetByIdQuery={useLazyGetRoleByIdQuery}
        useCreateMutation={useCreateRoleMutation}
        useUpdateMutation={useUpdateRoleMutation}
        useDeleteMutation={useDeleteRoleMutation}
        FormComponent={RoleForm}
      />
    </>
  )
}
export default Role