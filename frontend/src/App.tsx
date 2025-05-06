// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VnPayReturnPage from './pages/VnPayReturnPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <Router> {/* Bọc toàn bộ ứng dụng trong Router */}
      <Navbar /> {/* Hiển thị Navbar trên mọi trang */}
      <div style={{ padding: '20px' }}> {/* Thêm padding cho nội dung */}
        <Routes> {/* Định nghĩa các Route */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/result" element={<VnPayReturnPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} /> {/* Route cho trang không tồn tại */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;