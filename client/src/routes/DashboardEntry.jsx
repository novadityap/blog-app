import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Dashboard from '@/pages/private/Dashboard';

const DashboardEntry = () => {
  const { currentUser } = useSelector(state => state.auth);

  if (currentUser.role === 'admin') return <Dashboard />;
  if (currentUser.role === 'user') return <Navigate to="/dashboard/profile" replace />;

  return <Navigate to="/unauthorized" replace />;
};

export default DashboardEntry;
