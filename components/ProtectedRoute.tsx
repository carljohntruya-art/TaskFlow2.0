import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, requireAdmin = false }) => {
  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Requires admin but user is not admin
  if (requireAdmin && user.role !== 'admin') {
    alert("Access Denied: You do not have administrator privileges.");
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
