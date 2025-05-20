// src/router/AdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode; // Hoặc JSX.Element nếu bạn muốn chặt chẽ hơn
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { state: authState } = useAuth();
  const location = useLocation();

  if (authState.loading) {
    return <div>Loading authentication...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authState.user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>; // <<< Quan trọng: Render children
};

export default AdminRoute;