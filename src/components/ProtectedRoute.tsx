import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'driver' | 'rider';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, driver, rider, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={`/${userType}/login`} replace />;
  }

  // For driver routes
  if (userType === 'driver' && !driver) {
    return <Navigate to="/driver/login" replace />;
  }

  // For rider routes
  if (userType === 'rider' && !rider) {
    return <Navigate to="/rider/login" replace />;
  }

  return <>{children}</>;
}