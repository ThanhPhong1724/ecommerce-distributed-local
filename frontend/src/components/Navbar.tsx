import React, { useState } from 'react';
// import {API_BASE_URL} from './../services/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiHeart, FiInfo, FiFileText } from 'react-icons/fi';

const Logo = () => (
  <Link to="/" className="relative group">
    <span className="text-2xl font-bold transition-all duration-300 bg-gradient-to-r group-hover:from-brand-primary group-hover:to-brand-secondary bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
      SHOP
    </span>
    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary group-hover:w-full transition-all duration-300" />
  </Link>
);

const Navbar: React.FC = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
    setIsSearchOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Trang Chủ</Link>
            <Link to="/products" className="nav-link">Sản Phẩm</Link>
            <Link to="/about" className="nav-link">Giới Thiệu</Link>
            <Link to="/terms" className="nav-link">Điều Khoản</Link>
            
            {/* Thanh tìm kiếm */}
            <div className="relative group">
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-10'}`}>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className={`
                    w-full py-2 pl-10 pr-4 rounded-full 
                    border border-gray-200 focus:border-brand-primary
                    focus:ring-1 focus:ring-brand-primary
                    transition-all duration-300
                    ${isSearchOpen ? 'opacity-100' : 'opacity-0 w-0'}
                  `}
                />
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <FiSearch className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Cart Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowCartDropdown(true)}
              onMouseLeave={() => setShowCartDropdown(false)}
            >
              <Link to="/cart" className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
                <FiShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  0
                </span>
              </Link>

              {/* Cart Dropdown Content */}
              <AnimatePresence>
                {showCartDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900">Giỏ Hàng</h3>
                    </div>
                    {/* Cart Items Here */}
                    <div className="p-4">
                      <p className="text-sm text-gray-500">Chưa có sản phẩm trong giỏ</p>
                    </div>
                    {state.isAuthenticated && (
                      <Link 
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiPackage className="w-4 h-4 mr-2" />
                        Lịch sử đơn hàng
                      </Link>
                    )}
                    <div className="px-4 pt-4 border-t border-gray-100">
                      <Link
                        to="/cart"
                        className="block w-full px-4 py-2 text-center text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors"
                      >
                        Xem giỏ hàng
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {state.isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {state.user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">{state.user?.email}</p>
                  </div>
                  <Link to="/users/profile" className="menu-item">
                    <FiUser className="w-4 h-4" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                  <Link to="/orders" className="menu-item">
                    <FiPackage className="w-4 h-4" />
                    <span>Đơn hàng của tôi</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="menu-item text-red-600 hover:bg-red-50"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-secondary transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            <Link to="/cart" className="relative">
              <FiShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50"
          >
            {/* Mobile Menu Content */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-3">
                  <Link to="/" className="mobile-nav-link">
                    <span>Trang Chủ</span>
                  </Link>
                  <Link to="/products" className="mobile-nav-link">
                    <span>Sản Phẩm</span>
                  </Link>
                  <Link to="/about" className="mobile-nav-link">
                    <FiInfo className="w-5 h-5" />
                    <span>Giới Thiệu</span>
                  </Link>
                  <Link to="/terms" className="mobile-nav-link">
                    <FiFileText className="w-5 h-5" />
                    <span>Điều Khoản</span>
                  </Link>
                  {state.isAuthenticated && (
                    <Link to="/orders" className="mobile-nav-link">
                      <FiPackage className="w-5 h-5" />
                      <span>Lịch sử đơn hàng</span>
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
                        <p className="text-sm font-medium text-gray-900">
                          {state.user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{state.user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add these styles to your CSS */}
      <style>{`
              .nav-link {
          position: relative;
          color: #4B5563;
          font-medium: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: var(--brand-primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link {
          position: relative;
          padding: 0.5rem;
          color: #4B5563;
          font-medium: 500;
          transition: all 0.3s;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: var(--brand-primary);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          color: #4B5563;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background-color: #F3F4F6;
          color: var(--brand-primary);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #4B5563;
          font-medium: 500;
          transition: all 0.2s;
          border-radius: 0.5rem;
        }

        .mobile-nav-link:hover {
          background-color: #F3F4F6;
          color: var(--brand-primary);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;