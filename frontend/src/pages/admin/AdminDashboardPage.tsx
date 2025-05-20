// src/pages/admin/AdminDashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy thông tin admin nếu cần

const AdminDashboardPage: React.FC = () => {
  const { state: authState } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {authState.user && (
        <p className="mb-4 text-lg">
          Chào mừng trở lại, Quản trị viên{' '}
          <strong>{authState.user.email}!</strong>
        </p>
      )}

      <p className="mb-6 text-gray-600">
        Đây là trang tổng quan quản trị hệ thống E-commerce. Từ đây bạn có thể quản lý người dùng,
        sản phẩm, đơn hàng và các khía cạnh khác của cửa hàng.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card cho Quản lý Người dùng */}
        <Link
          to="/admin/users"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Quản lý Người dùng</h2>
          <p className="text-gray-700">Xem, sửa vai trò và quản lý tài khoản người dùng.</p>
        </Link>

        {/* Card cho Quản lý Sản phẩm */}
        <Link
          to="/admin/products"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold text-green-600 mb-2">Quản lý Sản phẩm</h2>
          <p className="text-gray-700">Thêm, sửa, xóa và quản lý tồn kho sản phẩm.</p>
        </Link>

        {/* Card cho Quản lý Đơn hàng (ví dụ) */}
        <Link
          to="/admin/orders" // Bạn sẽ tạo trang này sau
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold text-purple-600 mb-2">Quản lý Đơn hàng</h2>
          <p className="text-gray-700">Xem và cập nhật trạng thái các đơn hàng.</p>
        </Link>

        {/* Card cho Quản lý Danh mục (ví dụ) */}
        <Link
          to="/admin/categories" // Bạn sẽ tạo trang này sau
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">Quản lý Danh mục</h2>
          <p className="text-gray-700">Tạo và quản lý các danh mục sản phẩm.</p>
        </Link>

        {/* Thêm các card khác cho các chức năng khác nếu cần */}
      </div>

      {/* (Tùy chọn) Thêm các biểu đồ thống kê cơ bản ở đây sau này */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Thống kê nhanh (Ví dụ)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-gray-600">Tổng số người dùng:</p>
            <p className="text-2xl font-bold text-gray-800">125</p> {/* Số liệu giả */}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-gray-600">Tổng số sản phẩm:</p>
            <p className="text-2xl font-bold text-gray-800">82</p> {/* Số liệu giả */}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-gray-600">Đơn hàng mới hôm nay:</p>
            <p className="text-2xl font-bold text-gray-800">5</p> {/* Số liệu giả */}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-gray-600">Doanh thu hôm nay:</p>
            <p className="text-2xl font-bold text-gray-800">5.000.000 VNĐ</p> {/* Số liệu giả */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;