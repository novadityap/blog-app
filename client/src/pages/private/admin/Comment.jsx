import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useGetCommentsQuery,
  useLazyGetCommentByIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '@/services/commentApi.js';
import CommentForm from '@/components/ui/CommentForm.jsx';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';

const Comment = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('postId.title', {
      header: 'Post Title',
      size: 100,
    }),
    columnsHelper.accessor('userId.email', {
      header: 'User Email',
      size: 60,
    }),
    columnsHelper.accessor('content', {
      header: 'Content',
      size: 150,
    }),
    columnsHelper.accessor('numberOfLikes', {
      header: 'Likes',
      size: 60,
    }),
  ];

  return (
      <>
        <BreadcrumbNav />
        <h1 className="mb-4 text-2xl font-semibold">Comments</h1>
      
      <DataTable 
        columns={columns} 
        useGetQuery={useGetCommentsQuery}
        useLazyGetByIdQuery={useLazyGetCommentByIdQuery}
        useCreateMutation={useCreateCommentMutation}
        useUpdateMutation={useUpdateCommentMutation}
        useDeleteMutation={useDeleteCommentMutation}
        FormComponent={CommentForm}
        canAdd={false}
        canEdit={false}
      />
      </>

  );
};
export default Comment;
