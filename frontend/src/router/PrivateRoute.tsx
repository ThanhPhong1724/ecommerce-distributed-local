// Tạo file: src/router/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import hook useAuth
import { JSX } from 'react/jsx-runtime'

interface PrivateRouteProps {
  children: JSX.Element; // Component con muốn bảo vệ
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { state: authState } = useAuth(); // Lấy trạng thái xác thực
  const location = useLocation(); // Lấy vị trí hiện tại (để redirect lại sau khi login)

  // Nếu đang trong quá trình kiểm tra auth ban đầu (ví dụ: load từ localStorage)
  if (authState.loading) {
    return <div>Loading authentication...</div>; // Hoặc một component spinner đẹp hơn
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  // Đồng thời truyền state 'from' để biết trang trước đó người dùng muốn vào
  if (!authState.isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login from', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, render component con (trang được bảo vệ)
  return children;
};

export default PrivateRoute;