import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Set on the change-password route so it doesn't redirect onto itself. */
  allowPasswordChange?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowPasswordChange = false }) => {
  const { isAuthenticated, needsPasswordChange } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination.
    return <Navigate to="/customer-corner" state={{ from: location }} replace />;
  }

  // Force the first-login password change before any other protected page.
  if (needsPasswordChange && !allowPasswordChange) {
    return <Navigate to="/customer-corner/change-password" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
