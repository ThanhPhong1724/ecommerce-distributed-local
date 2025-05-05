// src/pages/CartPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Import hook

const CartPage: React.FC = () => {
  // <<< Sửa lại dòng này >>>
  const { state, updateQuantity, removeFromCart } = useCart();
  // Lấy isLoading từ state
  const { isLoading, items, error } = state; // <<< Lấy ra từ state
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
      removeFromCart(productId);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  // Sử dụng biến isLoading đã lấy từ state
  if (isLoading && items.length === 0) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  // Sử dụng biến error đã lấy từ state
  if (error) {
    return <div style={{ color: 'red' }}>Lỗi tải giỏ hàng: {error}</div>;
  }

  if (items.length === 0) {
    return (
      <div>
        <h2>Giỏ hàng của bạn</h2>
        <p>Giỏ hàng trống.</p>
        <Link to="/products">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Giỏ hàng của bạn</h2>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name || item.productId}</td>
              <td>{(item.price || 0).toLocaleString('vi-VN')} VNĐ</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)}
                  style={{ width: '50px' }}
                  disabled={state.isLoading}
                />
              </td>
              <td>{((item.price || 0) * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
              <td>
                <button onClick={() => handleRemoveItem(item.productId)} disabled={state.isLoading}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <div>
        <strong>Tổng cộng: {calculateTotal().toLocaleString('vi-VN')} VNĐ</strong>
      </div>
      <div style={{ marginTop: '20px' }}>
         {/* TODO: Nút Chuyển đến trang Checkout */}
        <button disabled={state.isLoading}>Tiến hành đặt hàng</button>
      </div>
    </div>
  );
};

export default CartPage;