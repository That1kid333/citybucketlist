import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export interface ProtectedRouteProps {
  children: ReactNode;
  userType: 'driver' | 'rider' | 'admin' | 'any';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, driver, rider, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute State:', {
    path: location.pathname,
    userType,
    hasUser: !!user,
    hasDriver: !!driver,
    hasRider: !!rider,
    loading
  });

  if (loading) {
    console.log('Loading state, showing spinner');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!user) {
    const loginPath = `/${userType}/login`;
    console.log('No user, redirecting to:', loginPath);
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check for specific user type requirements
  if (userType === 'driver') {
    if (!driver) {
      console.log('No driver data, redirecting to registration');
      return <Navigate to="/driver/register" state={{ from: location }} replace />;
    }
  } else if (userType === 'rider') {
    // For riders, we don't need to redirect to registration since they'll be registered during login
    if (!rider && !loading) {
      console.log('No rider data, but continuing to portal');
    }
  }

  console.log('All checks passed, rendering children');
  return <>{children}</>;
}