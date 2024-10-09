import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom';

import AppLayout from '@/components/layouts/AppLayout';
import Home from '@/pages/public/Home';
import PostDetail from '@/pages/public/PostDetail';
import Signin from '@/pages/public/Signin';
import Signup from '@/pages/public/Signup';
import EmailVerification from '@/pages/public/EmailVerification';
import ResendEmailVerification from '@/pages/public/ResendEmailVerification';
import RequestResetPassword from '@/pages/public/RequestResetPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import Unauthorized from '@/pages/public/Unauthorized';
import Profile from '@/pages/private/Profile';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Dashboard from '@/pages/private/admin/Dashboard';
import User from '@/pages/private/admin/User';
import Post from '@/pages/private/admin/Post';
import Comment from '@/pages/private/admin/Comment';
import Role from '@/pages/private/admin/Role';
import Permission from '@/pages/private/admin/Permission';
import Category from '@/pages/private/admin/Category';
import NotFound from '@/pages/public/NotFound';
import PrivateRoute from '@/routes/PrivateRoute';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="signin" element={<Signin />} />
        <Route path="signup" element={<Signup />} />
        <Route
          path="resend-email-verification"
          element={<ResendEmailVerification />}
        />
        <Route
          path="request-reset-password"
          element={<RequestResetPassword />}
        />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route
          path="email-verification/:token"
          element={<EmailVerification />}
        />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route element={<PrivateRoute requiredRoles={['admin']} />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<User />} />
          <Route path="posts" element={<Post />} />
          <Route path="comments" element={<Comment />} />
          <Route path="categories" element={<Category />} />
          <Route path="roles" element={<Role />} />
          <Route path="permissions" element={<Permission />} />
        </Route>
      </Route>
      <Route path="unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const AppRoute = () => {
  return <RouterProvider router={router} />;
};

export default AppRoute;
