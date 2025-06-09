import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardListIcon,
  MenuIcon,
  LogoutIcon,
  XIcon,
  CogIcon, 
  BellIcon,
  SearchIcon
} from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Logo = () => (
  <Link to="/admin" className="relative group">
    <span className="text-2xl font-bold transition-all duration-300 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-500">
      ADMIN
    </span>
    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300" />
  </Link>
);

const AdminLayout: React.FC = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/admin/users', name: 'Quản lý Users', icon: UsersIcon },
    { path: '/admin/products', name: 'Quản lý Products', icon: ShoppingBagIcon },
    { path: '/admin/categories', name: 'Quản lý Danh mục', icon: TagIcon },
    { path: '/admin/orders', name: 'Quản lý Đơn hàng', icon: ClipboardListIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className={`
            fixed inset-y-0 left-0 w-64 bg-white border-r shadow-lg z-30
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:inset-auto
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo section */}
            <div className="flex items-center h-16 px-6 border-b">
              <Logo />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ path, name, icon: Icon }) => (
                <motion.div
                  key={path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${location.pathname === path 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${
                      location.pathname === path ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-sm">{name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  dispatch({ type: 'LOGOUT' });
                  navigate('/login');
                }}
                className="flex items-center w-full px-4 py-2 space-x-3 rounded-lg
                  text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  data-testid="admin-logout-button"
              >
                <LogoutIcon className="h-5 w-5" />
                <span className="font-medium text-sm">Đăng xuất</span>
              </motion.button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/80 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSidebarOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSidebarOpen ? (
                      <XIcon className="h-5 w-5" />
                    ) : (
                      <MenuIcon className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                  <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 relative group"
              >
                <BellIcon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 group"
              >
                <CogIcon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </motion.button>

              {/* Admin Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <button className="flex items-center space-x-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">A</span>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/80">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;