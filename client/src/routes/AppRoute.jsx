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
import VerifyEmail from '@/pages/public/VerifyEmail';
import ResendVerification from '@/pages/public/ResendVerification';
import RequestResetPassword from '@/pages/public/RequestResetPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import Unauthorized from '@/pages/public/Unauthorized';
import Profile from '@/pages/private/Profile';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Dashboard from '@/pages/private/Dashboard';
import User from '@/pages/private/User';
import Post from '@/pages/private/Post';
import Comment from '@/pages/private/Comment';
import Role from '@/pages/private/Role';
import Category from '@/pages/private/Category';
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
          path="resend-verification"
          element={<ResendVerification />}
        />
        <Route
          path="request-reset-password"
          element={<RequestResetPassword />}
        />
        <Route path="reset-password/:resetToken" element={<ResetPassword />} />
        <Route
          path="verify-email/:verificationToken"
          element={<VerifyEmail />}
        />
        <Route path="profile" element={<PrivateRoute requiredRoles={['admin', 'user']}><Profile /></PrivateRoute>} />
      </Route>
      <Route element={<PrivateRoute requiredRoles={['admin']} />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<User />} />
          <Route path="posts" element={<Post />} />
          <Route path="comments" element={<Comment />} />
          <Route path="categories" element={<Category />} />
          <Route path="roles" element={<Role />} />
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
