import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import hasRole from '@/utils/hasRole';
import hasPermission from '@/utils/hasPermission';

const PrivateRoute = ({ requiredRoles, requiredPermissions }) => {
  const { token, roles, permissions } = useAuth();

  if (!token) return <Navigate to="/" />;

  const roleAllowed = requiredRoles ? requiredRoles.some(role => hasRole(roles, role)) : true;

  const permissionAllowed = requiredPermissions ? requiredPermissions.some(permission => hasPermission(permissions, permission.action, permission.resource)) : true;

  if (!roleAllowed || !permissionAllowed) return <Navigate to="unauthorized" />;

  return <Outlet />;
};

export default PrivateRoute;
