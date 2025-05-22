import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/shadcn-ui/card';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn-ui/form';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn-ui/avatar';
import { useSelector } from 'react-redux';
import { useShowUserQuery, useUpdateProfileMutation } from '@/services/userApi';
import useFormHandler from '@/hooks/useFormHandler';
import { useEffect } from 'react';
import { TbLoader } from 'react-icons/tb';

const Profile = () => {
  const currentUser = useSelector(state => state.auth.currentUser);
  const { data, isLoading, isFetching } = useShowUserQuery(currentUser._id);
  const {
    form,
    handleSubmit,
    isLoading: isLoadingUpdate,
  } = useFormHandler({
    formType: 'profile',
    params: [
      { name: 'userId', value: data?.data?._id },
    ],
    mutation: useUpdateProfileMutation,
    defaultValues: {
      avatar: '',
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (data?.data) {
      form.reset({
        avatar: data.data.avatar,
        username: data.data.username,
        email: data.data.email,
        password: '',
      });
    }
  }, [data]);

  if (isLoading || isFetching || !data?.data) return <ProfileSkeleton />;

  return (
    <>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-600">Profile</CardTitle>
          <CardDescription>Manage your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex justify-center">
                <Avatar className="size-32">
                  <AvatarImage
                    src={data?.data?.avatar}
                    fallback={
                      <AvatarFallback>{data?.data?.username}</AvatarFallback>
                    }
                  />
                </Avatar>
              </div>
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-32"
                  disabled={isLoadingUpdate}
                >
                  {isLoadingUpdate ? (
                    <>
                      <TbLoader className="animate-spin mr-2 size-5" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

const ProfileSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="w-1/3 h-6 mb-1" />
        <Skeleton className="w-1/2 h-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="size-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-full sm:w-28 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
