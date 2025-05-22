import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn-ui/form';

const RoleForm = ({
  initialValues,
  mutation,
  onComplete,
  onCancel,
  isCreate,
}) => {
  const { form, handleSubmit } = useFormHandler({
    formType: 'datatable',
    ...(!isCreate && { params: [{ name: 'roleId', value: initialValues._id }] }),
    mutation,
    onComplete,
    defaultValues: {
      name: initialValues.name ?? '',
    },
  });

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
          <Button type="submit">{isCreate ? 'Create' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
