import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, } from '@/components/ui/select';
import { TbLoader } from 'react-icons/tb';
import { useFormik } from 'formik';
import transformErrors from '@/utils/transformErrors';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useGetCategoriesQuery } from '@/services/categoryApi';

const PostForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isCreate,
  isLoading,
}) => {
  const { data: categories } = useGetCategoriesQuery();
  const [validationErrors, setValidationErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      postImage: initialValues?.postImage || '',
      title: initialValues?.title || '',
      content: initialValues?.content || '',
      category: initialValues?.category?._id || '',
    },
    enableReinitialize: true,
    onSubmit: async values => {
      if (!values.postImage) delete values.postImage

      const { errors } = await onSubmit(values);
      if (errors) setValidationErrors(transformErrors(errors));
    },
  });

  const handleContentChange = value => formik.setFieldValue('content', value)
  const handlePostImageChange = e => formik.setFieldValue('postImage', e.target.files[0]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <TbLoader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-scroll px-2">
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <div>
          {(!isCreate && initialValues?.postImage) && (
            <img src={initialValues?.postImage} alt="post image" className='w-full h-72 object-cover mb-3' />
          )}

          {isCreate && (
            <Label htmlFor="postImage">Post Image</Label>
          )}
          <Input
            id="postImage"
            name="postImage"
            type="file"
            accept="image/*"
            onChange={handlePostImageChange}
          />
          {validationErrors?.postImage && (
            <p className="text-red-500 text-sm">{validationErrors.postImage}</p>
          )}
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.title}
          />
          {validationErrors?.title && (
            <p className="text-red-500 text-sm">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
            <ReactQuill
              className='border border-neutral-200 rounded-md overflow-hidden focus:ring-2 focus:ring-blue-200 h-40'
              theme="snow"
              value={formik.values.content}
              onChange={handleContentChange}
            />
          {validationErrors?.content && (
            <p className="text-red-500 text-sm">{validationErrors.content}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            onValueChange={(value) => formik.setFieldValue('category', value)}
            id="category"
            value={formik.values.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories?.data?.map(category => (
                <SelectItem 
                  key={category._id} 
                  value={category._id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
           
          </Select>
          {validationErrors?.category && (
            <p className="text-red-500 text-sm">{validationErrors.category}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
