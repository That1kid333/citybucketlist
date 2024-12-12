import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export interface ProtectedRouteProps {
  children: ReactNode;
  userType: 'driver' | 'rider' | 'admin' | 'any';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, driver, rider, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${userType}/login`} replace />;
  }

  if (userType === 'driver' && !driver) {
    return <Navigate to="/driver/registration" replace />;
  }

  if (userType === 'rider' && !rider) {
    return <Navigate to="/rider/registration" replace />;
  }

  if (userType === 'admin' && !user.email?.endsWith('@company.com')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}