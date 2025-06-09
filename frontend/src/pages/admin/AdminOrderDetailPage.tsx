// src/pages/admin/AdminOrderDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getOrderByIdForAdmin,
  updateOrderDetailsForAdmin,
  OrderData,
  OrderItemData,
  OrderStatusApi,
  UpdateOrderAdminPayload
} from '../../services/orderApi';
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiEdit3,
  FiInfo,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTruck,
  FiShoppingBag,
  FiCalendar,
  FiSave,
  FiX
} from 'react-icons/fi';

const getStatusColorAndIcon = (status: OrderStatusApi | string) => {
  switch (status) {
    case OrderStatusApi.PENDING:
      return {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        bgGradient: 'from-yellow-50 to-yellow-100',
        icon: <FiClock className="w-4 h-4" />
      };
    case OrderStatusApi.PROCESSING:
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        bgGradient: 'from-blue-50 to-blue-100',
        icon: <FiRefreshCw className="w-4 h-4 animate-spin" />
      };
    case OrderStatusApi.COMPLETED:
      return {
        color: 'bg-green-50 text-green-700 border-green-200',
        bgGradient: 'from-green-50 to-green-100',
        icon: <FiCheckCircle className="w-4 h-4" />
      };
    case OrderStatusApi.CANCELLED:
      return {
        color: 'bg-red-50 text-red-700 border-red-200',
        bgGradient: 'from-red-50 to-red-100',
        icon: <FiXCircle className="w-4 h-4" />
      };
    case OrderStatusApi.FAILED:
      return {
        color: 'bg-pink-50 text-pink-700 border-pink-200',
        bgGradient: 'from-pink-50 to-pink-100',
        icon: <FiXCircle className="w-4 h-4" />
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        bgGradient: 'from-gray-50 to-gray-100',
        icon: <FiInfo className="w-4 h-4" />
      };
  }
};

const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatusApi | ''>('');
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy ID đơn hàng.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOrderByIdForAdmin(orderId);
      setOrder(data);
      setNewStatus(data.status as OrderStatusApi);
      setNewShippingAddress(data.shippingAddress || '');
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleUpdate = async (field: 'status' | 'shippingAddress') => {
    if (!orderId || !order) return;

    let payload: UpdateOrderAdminPayload = {};
    let confirmMessage = '';

    if (field === 'status') {
      if (!newStatus || newStatus === order.status) {
        setIsEditingStatus(false);
        return;
      }
      payload = { status: newStatus };
      confirmMessage = `Bạn chắc chắn muốn cập nhật trạng thái đơn hàng thành "${newStatus}"?`;
    } else if (field === 'shippingAddress') {
      if (newShippingAddress.trim() === (order.shippingAddress || '').trim()) {
        setIsEditingAddress(false);
        return;
      }
      payload = { shippingAddress: newShippingAddress.trim() };
      confirmMessage = 'Bạn chắc chắn muốn cập nhật địa chỉ giao hàng?';
    }

    if (Object.keys(payload).length === 0) return;

    if (window.confirm(confirmMessage)) {
      setUpdateLoading(true);
      setError(null);
      try {
        const updatedOrderData = await updateOrderDetailsForAdmin(orderId, payload);
        setOrder(updatedOrderData);
        if (field === 'status') setNewStatus(updatedOrderData.status as OrderStatusApi);
        if (field === 'shippingAddress') setNewShippingAddress(updatedOrderData.shippingAddress || '');
        alert('Cập nhật thành công!');
        setIsEditingStatus(false);
        setIsEditingAddress(false);
      } catch (err: any) {
        alert(`Lỗi cập nhật: ${err.message}`);
        setError(err.message || 'Lỗi cập nhật đơn hàng.');
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FiXCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
      </div>
    );
  }

  const statusInfo = getStatusColorAndIcon(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết Đơn hàng #{order.id.substring(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin và trạng thái đơn hàng
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-lg border-2 ${statusInfo.color} flex items-center space-x-2`}>
          {statusInfo.icon}
          <span className="font-semibold text-sm">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FiXCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FiUser className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email/ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {order.user?.email || `${order.userId.substring(0, 8)}...`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin đơn hàng</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt hàng</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</label>
                  <p className="mt-1 text-xl font-bold text-green-600">
                    {order.totalAmount.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Products List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPackage className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sản phẩm trong đơn hàng</h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {order.items.length} sản phẩm
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">ID: {item.productId.substring(0, 8)}...</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600">
                          Số lượng: <span className="font-medium">{item.quantity}</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Đơn giá: <span className="font-medium">{item.price.toLocaleString('vi-VN')} VNĐ</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Trạng thái đơn hàng</h3>
              </div>
              {!isEditingStatus && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingStatus(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  data-testid="edit-order-status-button" // data-testid cho nút "Thay đổi"
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Thay đổi
                </motion.button>
              )}
            </div>

            {isEditingStatus ? (
              <div className="space-y-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatusApi)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  data-testid="order-status-select" // data-testid cho dropdown select
                >
                  {Object.values(OrderStatusApi).map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdate('status')}
                    disabled={updateLoading || newStatus === order.status}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    data-testid="confirm-status-update-button" // data-testid cho nút "Cập nhật"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {updateLoading ? 'Đang lưu...' : 'Cập nhật'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditingStatus(false);
                      setNewStatus(order.status as OrderStatusApi);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                  >
                    <FiX className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg bg-gradient-to-r ${statusInfo.bgGradient} border-2 ${statusInfo.color}`}>
                <div className="flex items-center space-x-3">
                  {statusInfo.icon}
                  <span className="font-semibold" data-testid="current-order-status-text">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiMapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h3>
              </div>
              {!isEditingAddress && (order.status !== OrderStatusApi.COMPLETED && order.status !== OrderStatusApi.CANCELLED) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingAddress(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Sửa
                </motion.button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-4">
                <textarea
                  value={newShippingAddress}
                  onChange={(e) => setNewShippingAddress(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập địa chỉ giao hàng..."
                />
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdate('shippingAddress')}
                    disabled={updateLoading}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {updateLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditingAddress(false);
                      setNewShippingAddress(order.shippingAddress || '');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                  >
                    <FiX className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.shippingAddress || 'Chưa cung cấp địa chỉ giao hàng'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiClock className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thời gian</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cập nhật cuối:</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrderDetailPage;