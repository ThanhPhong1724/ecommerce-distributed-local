// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/orderApi'; // <<< Sẽ tạo hàm này
import { createPaymentUrl } from '../services/paymentApi'; // <<< Sẽ tạo hàm này

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
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
    <div>
      <h2>Thanh toán Đơn hàng</h2>

      {/* Phần tóm tắt giỏ hàng */}
      <div>
        <h3>Sản phẩm trong giỏ</h3>
        {cartState.items.length > 0 ? (
          <ul>
            {cartState.items.map(item => (
              <li key={item.productId}>
                {item.name || `Sản phẩm ID: ${item.productId}`} - SL: {item.quantity} - Giá: {(item.price || 0).toLocaleString('vi-VN')} VNĐ
              </li>
            ))}
          </ul>
        ) : (
          <p>Giỏ hàng trống.</p>
        )}
        <strong>Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} VNĐ</strong>
      </div>
      <hr />

      {/* Phần thông tin giao hàng */}
      <div>
        <h3>Thông tin giao hàng</h3>
        <label htmlFor="address">Địa chỉ:</label>
        <textarea
          id="address"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          rows={3}
          style={{ width: '100%', marginTop: '5px' }}
          required
        />
        {/* Thêm các trường khác: Tên người nhận, SĐT... */}
      </div>
      <hr />

      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}

      {/* Nút đặt hàng */}
      <button onClick={handlePlaceOrder} disabled={isLoading || cartState.items.length === 0}>
        {isLoading ? 'Đang xử lý...' : 'Đặt hàng và Thanh toán VNPay'}
      </button>
    </div>
  );
};

export default CheckoutPage;