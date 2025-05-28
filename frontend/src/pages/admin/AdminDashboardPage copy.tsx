  import React from 'react';
  import { Link } from 'react-router-dom';
  import { useAuth } from '../../contexts/AuthContext';
  import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
  } from 'recharts';
  import CountUp from 'react-countup';
  import {
    UsersIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    TrendingUpIcon,
    UserGroupIcon,
    ChartPieIcon,
    ViewGridIcon
  } from '@heroicons/react/outline';
  import { motion } from 'framer-motion';

  // Mock data
  const salesData = [
    { name: 'T2', revenue: 5200000 },
    { name: 'T3', revenue: 4800000 },
    { name: 'T4', revenue: 6100000 },
    { name: 'T5', revenue: 5900000 },
    { name: 'T6', revenue: 8100000 },
    { name: 'T7', revenue: 7400000 },
    { name: 'CN', revenue: 6800000 },
  ];

  const categoryData = [
    { name: 'Áo', value: 35 },
    { name: 'Quần', value: 25 },
    { name: 'Váy', value: 20 },
    { name: 'Phụ kiện', value: 20 },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  const AdminDashboardPage: React.FC = () => {
    const { state: authState } = useAuth();

    const StatCard = ({ icon: Icon, title, value, change, changeType }: any) => (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-semibold text-gray-800">
                <CountUp end={value} separator="." duration={2.5} />
              </p>
              {typeof change === 'number' && (
                <span className={`ml-2 text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? '+' : '-'}{change}%
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </motion.div>
    );

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Xin chào, {authState.user?.email}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Xuất báo cáo
            </button>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700">
              Xem chi tiết
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={CurrencyDollarIcon}
            title="Doanh thu hôm nay"
            value={8500000}
            change={12}
            changeType="increase"
          />
          <StatCard
            icon={ShoppingCartIcon}
            title="Đơn hàng mới"
            value={25}
            change={5}
            changeType="decrease"
          />
          <StatCard
            icon={UsersIcon}
            title="Khách hàng mới"
            value={12}
            change={8}
            changeType="increase"
          />
          <StatCard
            icon={ShoppingBagIcon}
            title="Sản phẩm đã bán"
            value={142}
            change={15}
            changeType="increase"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Doanh thu tuần qua</h3>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => `${value/1000000}M`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toLocaleString('vi-VN')}đ`]}
                    labelStyle={{ color: '#111827' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Phân bố danh mục</h3>
              <ChartPieIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  export default AdminDashboardPage;