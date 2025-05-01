import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ requiredRoles }) => {
  const { token, currentUser } = useSelector(state => state.auth);

  if (!token) return <Navigate to="/" />;
  if (!requiredRoles.includes(currentUser.role)) return <Navigate to="unauthorized" />;

  return <Outlet />;
};

export default PrivateRoute;
