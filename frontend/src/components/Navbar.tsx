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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-brand-primary hover:text-brand-secondary">
              YourLogo
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            <Link to="/" className={navLinkClasses}>Trang Chủ</Link>
            <Link to="/products" className={navLinkClasses}>Sản Phẩm</Link>
            {state.isAuthenticated && (
              <Link to="/orders/history" className={navLinkClasses}>Lịch sử đơn hàng</Link>
            )}
            <Link to="/cart" className={`${navLinkClasses} flex items-center`}>
              {/* <ShoppingCartIcon className="h-5 w-5 mr-1" />  */}
              <span>🛒</span> {/* Thay bằng icon thật */}
              Giỏ Hàng
            </Link>
          </div>

          {/* Auth Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {state.isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-brand-primary focus:outline-none">
                  {/* <UserCircleIcon className="h-6 w-6 mr-1" /> */}
                  <span>👤</span> {/* Thay bằng icon thật */}
                  {state.user?.email?.split('@')[0]} {/* Hiển thị phần trước @ của email */}
                  {/* <ChevronDownIcon className="h-4 w-4 ml-1 group-hover:rotate-180 transition-transform" /> */}
                  <span className="ml-1">▼</span>
                </button>
                <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block ring-1 ring-black ring-opacity-5">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-primary">Tài khoản</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-primary"
                  >
                    {/* <LogoutIcon className="h-5 w-5 mr-2 inline" /> */}
                    Đăng Xuất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-brand-primary transition-colors duration-300">Đăng Nhập</Link>
                <Link
                  to="/register"
                  className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors duration-300"
                >
                  Đăng Ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className={`${navLinkClasses} flex items-center mr-4 md:hidden`}>
              <span>🛒</span> {/* Thay bằng icon thật */}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Mở menu chính</span>
              {isMobileMenuOpen ? (
                // <XIcon className="block h-6 w-6" aria-hidden="true" />
                <span>✖️</span> // Icon đóng
              ) : (
                // <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                <span>☰</span> // Icon mở (hamburger)
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right md:hidden z-40 bg-white shadow-lg ring-1 ring-black ring-opacity-5" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Trang Chủ</Link>
            <Link to="/products" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Sản Phẩm</Link>
            {state.isAuthenticated && (
              <Link to="/orders/history" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Lịch sử đơn hàng</Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {state.isAuthenticated ? (
              <>
                <div className="flex items-center px-3 mb-2">
                  {/* <UserCircleIcon className="h-8 w-8 text-gray-500 mr-2" /> */}
                  <span className="text-lg mr-2">👤</span>
                  <div>
                    <div className="text-base font-medium text-gray-800">{state.user?.email?.split('@')[0]}</div>
                    <div className="text-sm font-medium text-gray-500">{state.user?.email}</div>
                  </div>
                </div>
                 <Link to="/profile" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Tài khoản</Link>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className={`${mobileNavLinkClasses} w-full text-left`}
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <Link to="/login" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Đăng Nhập</Link>
                <Link to="/register" className={`${mobileNavLinkClasses} bg-brand-primary text-white hover:bg-brand-secondary`} onClick={() => setIsMobileMenuOpen(false)}>
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;