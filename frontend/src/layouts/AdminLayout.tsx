// src/layouts/AdminLayout.tsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={{ width: '200px', background: '#333', color: 'white', padding: '20px' }}>
        <h2>Admin Panel</h2>
        <ul>
          <li style={{ marginBottom: '10px' }}><Link to="/admin/dashboard" style={{ color: 'white' }}>Dashboard</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/admin/users" style={{ color: 'white' }}>Quản lý Users</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/admin/products" style={{ color: 'white' }}>Quản lý Products</Link></li>
          {/* Thêm các link khác */}
          <li style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} style={{ background: 'grey', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}>Đăng Xuất</button>
          </li>
        </ul>
      </nav>
      <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
        <Outlet /> {/* Đây là nơi các component con của route Admin sẽ render */}
      </main>
    </div>
  );
};

export default AdminLayout;