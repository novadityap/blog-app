'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { useListCategoriesQuery } from '@/services/categoryApi';
import {
  useCreatePostMutation,
  useUpdatePostMutation,
  useShowPostQuery,
} from '@/services/postApi';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/shadcn/select';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import { AspectRatio } from '@/components/shadcn/aspect-ratio';
import { TbLoader } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn/skeleton';
import Image from 'next/image';

const PostFormSkeleton = ({isCreate}) => (
  <div className="space-y-4">
    {!isCreate && (
      <div className="flex justify-center">
      <Skeleton className="size-52 rounded-sm" />
    </div>
    )}
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  </div>
);

const PostForm = ({ id, onSubmitComplete, onCancel, isCreate }) => {
  const { data: categories, isLoading: isCategoriesLoading } =
    useListCategoriesQuery();
  const { data: post, isLoading: isPostLoading } = useShowPostQuery(id, {
    skip: isCreate || !id,
  });
  const { form, handleSubmit, isLoading } = useFormHandler({
    isCreate,
    fileFieldname: 'image',
    mutation: isCreate ? useCreatePostMutation : useUpdatePostMutation,
    onSubmitComplete,
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
    ...(!isCreate && {
      params: [{ name: 'postId', value: id }],
    }),
  });

  useEffect(() => {
    if (!isCreate && post?.data && categories?.data) {
      form.reset({
        title: post.data.title,
        content: post.data.content,
        category: post.data.category.id,
      });
    }
  }, [post, categories]);

  if (isPostLoading || isCategoriesLoading) return <PostFormSkeleton isCreate={isCreate} />;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isCreate && post?.data?.image && (
          <AspectRatio ratio={16 / 9}>
            <Image
              fill
              src={post.data.image}
              alt="post image"
              className="size-full object-cover"
            />
          </AspectRatio>
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => field.onChange(e.target.files[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  style={{ height: '200px', marginBottom: '90px' }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      ['blockquote', 'code-block'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ script: 'sub' }, { script: 'super' }],
                      [{ indent: '-1' }, { indent: '+1' }],
                      ['link', 'image', 'video'],
                      ['clean'],
                    ],
                  }}
                  placeholder="Write something..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                key={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.data?.map(category => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      selected={category.id === field.value}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <TbLoader className="animate-spin" />
                {isCreate ? 'Creating..' : 'Updating..'}
              </>
            ) : isCreate ? (
              'Create'
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
