// src/pages/VnPayReturnPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getOrderDetails } from '../services/orderApi';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiHome, FiFileText, FiLoader } from 'react-icons/fi';

const VnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart(); // Giả định clearCart là một hàm async

  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null); // Sử dụng tên biến khác để rõ ràng

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const codeParam = searchParams.get('code');
        const orderIdParam = searchParams.get('orderId');
        const messageParam = searchParams.get('message');

        if (orderIdParam) {
          setDisplayOrderId(orderIdParam);
          
          // Thêm phần này để cập nhật trạng thái đơn hàng
          try {
            const orderDetails = await getOrderDetails(orderIdParam);
            console.log('Updated order status:', orderDetails.status);
            
            // Nếu thanh toán thành công
            if (codeParam === '00') {
              setIsSuccess(true);
              setMessage('Thanh toán thành công!');
              if (typeof clearCart === 'function') {
                await clearCart();
              }
            } else {
              setIsSuccess(false);
              setMessage(messageParam ? decodeURIComponent(messageParam) : 'Thanh toán thất bại');
            }
          } catch (orderError) {
            console.error('Error fetching order details:', orderError);
            setMessage('Không thể cập nhật trạng thái đơn hàng');
          }
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
        setIsSuccess(false);
      }
    };

    processPaymentResult();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Payment Status Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Status Icon */}
          <div className="p-8 flex flex-col items-center">
            {isSuccess === null ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 text-purple-500"
              >
                <FiLoader className="w-full h-full" />
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 text-green-500"
              >
                <FiCheckCircle className="w-full h-full" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 text-red-500"
              >
                <FiXCircle className="w-full h-full" />
              </motion.div>
            )}

            {/* Status Message */}
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {isSuccess === null ? 'Đang xử lý' : 
               isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              {message}
            </p>

            {displayOrderId && (
              <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Mã đơn hàng: <span className="font-medium text-gray-900">{displayOrderId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                <FiHome className="w-5 h-5" />
                <span>Về trang chủ</span>
              </motion.button>

              {displayOrderId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/orders/${displayOrderId}`)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
                >
                  <FiFileText className="w-5 h-5" />
                  <span>Chi tiết đơn hàng</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center gap-4 text-green-600">
              <FiCheckCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Đơn hàng đã được xác nhận</h3>
                <p className="text-sm text-gray-600">
                  Chúng tôi sẽ sớm liên hệ để giao hàng cho bạn
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message Card */}
        {isSuccess === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-red-50 rounded-2xl shadow-sm p-6 border border-red-100"
          >
            <div className="flex items-center gap-4 text-red-600">
              <FiXCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Gặp sự cố khi thanh toán</h3>
                <p className="text-sm text-gray-600">
                  Vui lòng kiểm tra lại thông tin hoặc thử lại sau
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VnPayReturnPage;