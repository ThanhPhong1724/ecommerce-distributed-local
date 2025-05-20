// src/pages/OrderDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, OrderDetail as OrderDetailType, OrderItem } from '../services/orderApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiShoppingBag, 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign,
  FiArrowLeft,
  FiTruck
} from 'react-icons/fi';

// Helper function để format tiền tệ
const formatCurrency = (amount: string | number): string => {
  const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberAmount);
};

// Helper function để hiển thị trạng thái đơn hàng thân thiện hơn
const getOrderStatusDisplay = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Đang chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'shipping':
      return 'Đang giao hàng';
    case 'completed':
      return 'Hoàn thành';
    case 'failed':
      return 'Thất bại';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderDetails(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message || 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <FiX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600">{error}</p>
          <Link 
            to="/orders"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <Link 
            to="/orders"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'shipping': return 'text-purple-600 bg-purple-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/orders"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết đơn hàng #{order.id.substring(0, 8)}
          </h1>
        </div>

        {/* Order Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
            <FiPackage className="w-5 h-5" />
            <span className="font-medium">{getOrderStatusDisplay(order.status)}</span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <FiCalendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiDollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Địa chỉ giao hàng
          </h2>
          <div className="flex items-start gap-3">
            <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
            <p className="text-gray-600">{order.shippingAddress}</p>
          </div>
        </motion.div>

        {/* Order Items Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm đã đặt
            </h2>
          </div>

          <div className="border-t border-gray-100">
            {order.items.map((item: OrderItem) => (
              <div 
                key={item.id}
                className="p-6 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.productImage ? (
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link 
                      to={`/products/${item.productId}`}
                      className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(parseFloat(item.price) * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} / sản phẩm
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Tổng cộng</span>
              <span className="text-xl font-bold text-purple-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailPage;