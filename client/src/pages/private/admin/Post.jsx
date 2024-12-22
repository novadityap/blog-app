import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useSearchPostsQuery,
  useLazyShowPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useRemovePostMutation,
} from '@/services/postApi.js';
import PostForm from '@/components/ui/PostForm.jsx';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';

const Post = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('title', {
      header: 'Title',
      size: 150,
    }),
    columnsHelper.accessor('userId', {
      header: 'Author',
      size: 60,
      cell: info => {
        const user = info.getValue();
        return user.email;
      },
    }),
    columnsHelper.accessor('category.name', {
      header: 'Category',
      size: 60,
    }),
    columnsHelper.accessor('updatedAt', {
      header: 'Last Modified',
      size: 120,
      cell: info => {
        const date = new Date(info.getValue());
        return date.toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });
      },
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <h1 className="mb-4 text-2xl font-semibold">Posts</h1>

      <DataTable
        columns={columns}
        useGetQuery={useSearchPostsQuery}
        useLazyGetByIdQuery={useLazyShowPostQuery}
        useCreateMutation={useCreatePostMutation}
        useUpdateMutation={useUpdatePostMutation}
        useDeleteMutation={useRemovePostMutation}
        FormComponent={PostForm}
      />
    </>
  );
};
export default Post;
