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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn-ui/card';

const Category = () => {
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
          <CardTitle className="text-gray-600">Categories</CardTitle>
          <CardDescription>Manage categories</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchCategoriesQuery}
            lazyShowQuery={useLazyShowCategoryQuery}
            createMutation={useCreateCategoryMutation}
            updateMutation={useUpdateCategoryMutation}
            removeMutation={useRemoveCategoryMutation}
            FormComponent={CategoryForm}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Category;
