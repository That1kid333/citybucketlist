import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, driver, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/driver/login" replace />;
  }

  // If user is logged in but hasn't completed registration
  if (!driver && location.pathname !== '/driver/register') {
    return <Navigate to="/driver/register" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;