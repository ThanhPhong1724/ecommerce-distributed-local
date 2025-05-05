// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <<< Import useAuth

const Navbar: React.FC = () => {
  const { state, dispatch } = useAuth(); // <<< Lấy state và dispatch từ context
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' }); // Dispatch action logout
    navigate('/login'); // Chuyển về trang login
  };

  return (
    <nav style={{ background: '#eee', padding: '10px', marginBottom: '20px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '15px', alignItems: 'center' }}>
        <li><Link to="/">Trang Chủ</Link></li>
        <li><Link to="/products">Sản Phẩm</Link></li>
        <li><Link to="/cart">Giỏ Hàng</Link></li>
        <li style={{ marginLeft: 'auto' }}> {/* Đẩy các nút sau về bên phải */}
          {state.isAuthenticated ? (
            <>
              {/* Có thể thêm link đến trang Profile sau */}
              <span style={{ marginRight: '10px' }}>Chào, {state.user?.email}!</span>
              <button onClick={handleLogout}>Đăng Xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '10px' }}>Đăng Nhập</Link>
              <Link to="/register">Đăng Ký</Link>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;