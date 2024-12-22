import DataTable from '@/components/ui/DataTable';
import {
  useSearchCategoriesQuery,
  useLazyShowCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useRemoveCategoryMutation,
} from '@/services/categoryApi';
import CategoryForm from '@/components/ui/CategoryForm';
import { createColumnHelper } from '@tanstack/react-table';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';

const Category = () => {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 250,
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <h1 className="mb-4 text-2xl font-semibold">Categories</h1>
      <DataTable
        columns={columns}
        useGetQuery={useSearchCategoriesQuery}
        useLazyGetByIdQuery={useLazyShowCategoryQuery}
        useCreateMutation={useCreateCategoryMutation}
        useUpdateMutation={useUpdateCategoryMutation}
        useDeleteMutation={useRemoveCategoryMutation}
        FormComponent={CategoryForm}
      />
    </>
  );
};

export default Category;
