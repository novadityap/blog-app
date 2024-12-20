import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/services/userApi';
import transformErrors from '@/utils/transformErrors';
import { TbCircleCheck } from 'react-icons/tb';
import { Skeleton } from '@/components/ui/skeleton';
import { setCurrentUser } from '@/features/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth?.currentUser ?? {});
  const { id } = currentUser;
  const {
    data: user,
    isLoading: isLoadingQuery,
    isSuccess: isSuccessQuery,
  } = useGetUserByIdQuery(id);
  const [
    updateUser,
    { isLoading: isLoadingMutation, isSuccess: isSuccessMutation },
  ] = useUpdateUserMutation();
  const [validationErrors, setValidationErrors] = useState({});
  const [avatar, setAvatar] = useState('');

  const formik = useFormik({
    initialValues: {
      username: user?.data?.username || '',
      email: user?.data?.email || '',
      avatar: null,
    },
    enableReinitialize: true,
    onSubmit: async values => {
      if (!values.avatar) delete values.avatar;

      try {
        const {
          data: { username, email, avatar },
        } = await updateUser({ data: values, id }).unwrap();

        formik.setValues({
          username,
          email,
          avatar: null,
        });

        if (avatar !== currentUser.avatar) {
          setAvatar(avatar);
          dispatch(
            setCurrentUser(Object.assign(currentUser, { avatar, username, email}))
          );
        } else {
          dispatch(
            setCurrentUser(Object.assign(currentUser, { username, email}))
          );
        }

        setValidationErrors({});
      } catch (err) {
        if (err.code === 400) {
          setValidationErrors(transformErrors(err.errors));
          return;
        }

        if (err.code === 409) {
          setValidationErrors({ email: err.message });
          return;
        }

        return;
      }
    },
  });

  const handleAvatarChange = e => {
    formik.setFieldValue('avatar', e.target.files[0]);
  };

  useEffect(() => {
    if (isSuccessQuery) {
      setAvatar(user.data.avatar);
    }
  }, [user, isSuccessQuery, setAvatar]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-y-4">
      {isSuccessMutation && (
        <Alert variant="success" className="w-full md:w-4/5 lg:w-1/2">
          <TbCircleCheck className=" text-green-500 size-5" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Profile updated successfully</AlertDescription>
        </Alert>
      )}

      <Card className="w-full md:w-4/5 lg:w-1/2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-500">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMutation || isLoadingQuery ? (
            <div className="flex flex-col space-y-5">
              <Skeleton className="h-56 w-96 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ) : isSuccessQuery || isSuccessMutation ? (
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="size-40">
                    <AvatarImage src={avatar} alt="User Avatar" />
                    <AvatarFallback>
                      {formik.values.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                />

                {validationErrors?.username && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />

                {validationErrors?.email && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Save Changes
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
