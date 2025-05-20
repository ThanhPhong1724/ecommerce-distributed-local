// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMapPin, FiTruck, FiLock, FiCreditCard, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { createOrder } from '../services/orderApi';
import { createPaymentUrl } from '../services/paymentApi';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productImage?: string | null; // Optional field for product image
}

interface CreateOrderPayload {
  shippingAddress: string;
  orderItems: OrderItem[]; // Changed from 'items' to 'orderItems'
}

const CheckoutPage: React.FC = () => {
  const { state: cartState } = useCart(); // Lấy state giỏ hàng và hàm clearCart
  const { state: authState } = useAuth(); // Lấy trạng thái đăng nhập
  const navigate = useNavigate();

  // State cho thông tin giao hàng
  const [shippingAddress, setShippingAddress] = useState<string>('');
  // State cho loading và error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin user để điền sẵn (nếu có)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Giả sử có thông tin địa chỉ trong user profile (cần cập nhật AuthContext)
      // setShippingAddress(authState.user.address || '');
      // Tạm thời để trống hoặc lấy từ đâu đó
      setShippingAddress('123 Đường ABC, Quận 1, TP.HCM'); // Ví dụ
    }
  }, [authState.isAuthenticated, authState.user]);

  const calculateTotal = () => {
    return cartState.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!authState.isAuthenticated || !authState.token) {
      setError('Vui lòng đăng nhập để đặt hàng.');
      localStorage.setItem('redirectPath', '/checkout');
      navigate('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (cartState.items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate và format dữ liệu trước khi gửi
      const orderItems = cartState.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price || 0)
      }));

      // Thêm logging để debug
      console.log('Cart items before order:', cartState.items);
      console.log('Order items being sent:', orderItems);
      
      // Kiểm tra dữ liệu
      const invalidItems = orderItems.filter(item => 
        !item.productId || 
        isNaN(item.quantity) || 
        item.quantity <= 0 ||
        isNaN(item.price) || 
        item.price < 0
      );

      if (invalidItems.length > 0) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
      }

      const orderPayload: CreateOrderPayload = {
        shippingAddress: shippingAddress.trim(),
        orderItems: orderItems // Changed from 'items' to 'orderItems'
      };

      console.log('Sending order payload:', orderPayload);
      const orderData = await createOrder(orderPayload);
      console.log('Order created:', orderData);

      // Xử lý thanh toán
      try {
        const paymentUrlData = await createPaymentUrl({
          orderId: orderData.id,
          amount: orderData.totalAmount,
          orderDescription: `Thanh toan don hang ${orderData.id}`,
          language: 'vn',
        });

        if (paymentUrlData?.url) {
          localStorage.setItem('pendingOrderId', orderData.id);
          window.location.href = paymentUrlData.url;
        } else {
          throw new Error('Không nhận được URL thanh toán');
        }
      } catch (paymentError: any) {
        console.error('Payment URL creation failed:', paymentError);
        setError(paymentError.message || 'Không thể tạo URL thanh toán');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      setError(error.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
                <p className="mt-2 text-gray-600">
                  Vui lòng kiểm tra thông tin đơn hàng trước khi thanh toán
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Địa chỉ giao hàng
                    </h2>
                    <p className="text-sm text-gray-600">
                      Nhập địa chỉ nhận hàng chính xác
                    </p>
                  </div>
                </div>

                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows={3}
                />
              </div>

              <div className="lg:hidden">
                <OrderSummaryContent 
                  items={cartState.items} 
                  isLoading={isLoading} 
                  calculateTotal={calculateTotal}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FiCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Phương thức thanh toán
                    </h2>
                    <p className="text-sm text-gray-600">
                      Thanh toán an toàn qua cổng VNPAY
                    </p>
                  </div>
                </div>

                <div className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/vnpay-logo.png" 
                      alt="VNPAY" 
                      className="h-8" 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">VNPAY</p>
                      <p className="text-sm text-gray-600">
                        Thanh toán qua Internet Banking
                      </p>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-8">
              <OrderSummaryContent 
                items={cartState.items} 
                isLoading={isLoading} 
                calculateTotal={calculateTotal}
                error={error}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-full shadow-lg"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

const OrderSummaryContent: React.FC<{
  items: any[];
  isLoading: boolean;
  calculateTotal: () => number;
  error?: string | null;
  onPlaceOrder?: () => void;
}> = ({ items, isLoading, calculateTotal, error, onPlaceOrder }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">
      Tổng quan đơn hàng
    </h2>

    <div className="space-y-4 mb-6">
      {items.map((item) => (
        <div key={item.productId} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={item.img || '/placeholder.jpg'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h4>
            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
            <p className="text-sm font-medium text-purple-600">
              {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-3 py-6 border-t border-gray-100">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tạm tính</span>
        <span className="font-medium text-gray-900">
          {calculateTotal().toLocaleString('vi-VN')}₫
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Phí vận chuyển</span>
        <span className="font-medium text-green-600">Miễn phí</span>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-900">Tổng cộng</span>
          <span className="text-xl font-bold text-purple-600">
            {calculateTotal().toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
    </div>

    {onPlaceOrder && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlaceOrder}
        disabled={isLoading || items.length === 0}
        className="w-full mt-6 px-6 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <FiLock className="w-5 h-5" />
            <span>Đặt hàng và Thanh toán</span>
          </>
        )}
      </motion.button>
    )}

    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FiTruck className="w-5 h-5 text-green-500" />
        <span>Giao hàng miễn phí</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FiLock className="w-5 h-5 text-green-500" />
        <span>Thanh toán bảo mật</span>
      </div>
    </div>
  </div>
);

export default CheckoutPage;