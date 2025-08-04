'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { TbLoader } from 'react-icons/tb';
import {
  useShowCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/services/categoryApi';
import { useEffect } from 'react';
import { Skeleton } from '@/components/shadcn/skeleton';

const CategoryFormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" /> 
      <Skeleton className="h-10 w-full rounded-md" /> 
    </div>
    <div className="flex justify-end gap-x-2">
      <Skeleton className="h-10 w-24 rounded-md" /> 
      <Skeleton className="h-10 w-24 rounded-md" /> 
    </div>
  </div>
);

const CategoryForm = ({
  id,
  onSubmitComplete,
  onCancel,
  isCreate,
}) => {
  const { data: category, isLoading: isCategoryLoading } = useShowCategoryQuery(id, {
    skip: isCreate || !id
  });
  const { form, handleSubmit, isLoading } = useFormHandler({
    isCreate,
    mutation: isCreate ? useCreateCategoryMutation : useUpdateCategoryMutation,
    onSubmitComplete,
    defaultValues: {
      name: '',
    },
    ...(!isCreate && {params: [{ name: 'categoryId', value: id }]}),
  });

  useEffect(() => {
      if (!isCreate && category?.data) form.reset({ name: category.data.name });
  }, [category]);

  if (isCategoryLoading) return <CategoryFormSkeleton />;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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

export default CategoryForm;
