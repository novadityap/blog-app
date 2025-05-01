import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { useLazyListCategoriesQuery } from '@/services/categoryApi';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/shadcn-ui/select';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn-ui/form';
import { useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import { AspectRatio } from '@/components/shadcn-ui/aspect-ratio';

const PostForm = ({
  initialValues,
  mutation,
  onComplete,
  onCancel,
  isCreate,
}) => {
  const [fetchCategories, { data: categories }] = useLazyListCategoriesQuery();
  const { form, handleSubmit } = useFormHandler({
    isDatatableForm: true,
    ...(!isCreate && { ids: { postId: initialValues._id } }),
    mutation,
    onComplete,
    defaultValues: {
      postImage: '',
      title: initialValues.title || '',
      content: initialValues.content || '',
      category: initialValues.category?._id || '',
    },
  });

  useEffect(() => {
    if (!isCreate) fetchCategories();
  }, [fetchCategories, isCreate]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isCreate && (
          <AspectRatio ratio={16 / 9}>
            <img
              src={initialValues.postImage}
              alt="post image"
              className="size-full object-cover"
            />
          </AspectRatio>
        )}
        <FormField
          control={form.control}
          name="postImage"
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
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={open => open && !categories && fetchCategories()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.data?.map(category => (
                    <SelectItem
                      key={category._id}
                      value={category._id}
                      selected={category._id === field.value}
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
          <Button type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
