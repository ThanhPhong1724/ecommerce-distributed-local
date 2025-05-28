// src/components/AppEntry.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

const AppEntry: React.FC = () => {
  const { state } = useAuth();

  // Nếu đang loading auth state, có thể hiển thị loading spinner
  if (state.loading) {
    return <div>Loading...</div>;
  }

  // Nếu đã đăng nhập và là admin
  if (state.isAuthenticated && state.user?.role === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Mặc định trả về HomePage cho cả user đã đăng nhập và chưa đăng nhập
  return <Navigate to="/" replace />;
};

export default AppEntry;