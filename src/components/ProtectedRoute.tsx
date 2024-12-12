import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresDriver?: boolean;
  requiresRider?: boolean;
}

function ProtectedRoute({ children, requiresDriver = false, requiresRider = false }: ProtectedRouteProps) {
  const { user, driver, rider, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', {
    pathname: location.pathname,
    requiresDriver,
    requiresRider,
    hasUser: !!user,
    hasDriver: !!driver,
    hasRider: !!rider,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    // Redirect to appropriate login page based on the route
    const isDriverRoute = location.pathname.startsWith('/driver');
    return <Navigate to={isDriverRoute ? '/driver/login' : '/rider/login'} state={{ from: location }} replace />;
  }

  // Handle driver-specific routes
  if (requiresDriver) {
    if (!driver && location.pathname !== '/driver/registration') {
      console.log('Driver required but not found, redirecting to registration');
      return <Navigate to="/driver/registration" state={{ from: location }} replace />;
    }
  }

  // Handle rider-specific routes
  if (requiresRider) {
    if (!rider && location.pathname !== '/rider/registration') {
      console.log('Rider required but not found, redirecting to registration');
      return <Navigate to="/rider/registration" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;