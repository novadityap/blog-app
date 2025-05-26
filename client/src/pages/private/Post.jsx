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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn-ui/card';

const Post = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('title', {
      header: 'Title',
      size: 200,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('user.username', {
      header: 'Author',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('category.name', {
      header: 'Category',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('totalLikes', {
      header: 'Total Likes',
      size: 60,
    }),
  ];

  return (
    <>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-600">Posts</CardTitle>
          <CardDescription>Manage posts</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchPostsQuery}
            lazyShowQuery={useLazyShowPostQuery}
            createMutation={useCreatePostMutation}
            updateMutation={useUpdatePostMutation}
            removeMutation={useRemovePostMutation}
            FormComponent={PostForm}
          />
        </CardContent>
      </Card>
    </>
  );
};
export default Post;
