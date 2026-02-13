import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes that require authentication.
 * Redirects to loginPath (or /login) if not authenticated; to /login if wrong role.
 */
export default function ProtectedRoute({ children, allowedRoles, loginPath = '/login' }) {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Only force password change when they have a temp password (new user or admin reset). Cleared after they set a new password.
  if (profile.role !== 'master_admin' && profile.is_temp_password === true) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
