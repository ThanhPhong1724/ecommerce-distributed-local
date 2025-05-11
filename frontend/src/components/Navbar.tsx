import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Giữ nguyên

// Giả sử bạn có icon (ví dụ từ Heroicons hoặc React Icons)
// import { ShoppingCartIcon, UserCircleIcon, LogoutIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

const Navbar: React.FC = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const navLinkClasses = "text-gray-700 hover:text-brand-primary transition-colors duration-300";
  const mobileNavLinkClasses = "block py-2 px-3 text-base text-gray-700 hover:bg-gray-100 hover:text-brand-primary rounded-md";

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-black hover:opacity-80 transition-opacity">
              Logo
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className={navLinkClasses}>Trang Chủ</Link>
            <Link to="/products" className={navLinkClasses}>Sản Phẩm</Link>
            {state.isAuthenticated && (
              <Link to="/orders/history" className={navLinkClasses}>Lịch sử đơn hàng</Link>
            )}
            <Link to="/cart" className="relative group">
              <div className={`${navLinkClasses} flex items-center space-x-1`}>
                <span className="text-xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  0
                </span>
              </div>
            </Link>
          </div>

          {/* Auth Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {state.isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-brand-primary focus:outline-none p-2 rounded-lg group-hover:bg-gray-50 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white flex items-center justify-center text-sm font-medium">
                    {state.user?.email?.[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{state.user?.email?.split('@')[0]}</span>
                  <span className="transform group-hover:rotate-180 transition-transform duration-300">▼</span>
                </button>
                <div className="absolute right-0 w-56 mt-2 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{state.user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 mt-1">{state.user?.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors">
                    <span className="mr-2">👤</span>
                    Tài khoản của tôi
                  </Link>
                  <Link to="/orders/history" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors">
                    <span className="mr-2">📦</span>
                    Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="mr-2">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-brand-primary transition-colors duration-300 font-medium">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors"
            >
              <span className="sr-only">Mở menu chính</span>
              {isMobileMenuOpen ? <span className="text-xl">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              <Link to="/" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Trang Chủ</Link>
              <Link to="/products" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Sản Phẩm</Link>
              {state.isAuthenticated && (
                <Link to="/orders/history" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
                  Lịch sử đơn hàng
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 p-4">
            {state.isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white flex items-center justify-center text-lg font-medium">
                    {state.user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{state.user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{state.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 text-center text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-3 text-center text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;