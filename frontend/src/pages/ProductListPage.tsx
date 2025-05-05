// src/pages/ProductListPage.tsx
import React, { useState, useEffect } from 'react';
import { getProducts, Product } from '../services/productApi'; // Import hàm và kiểu
import { useCart } from '../contexts/CartContext'; // <<< Import useCart
import { useAuth } from '../contexts/AuthContext'; // Import useAuth để kiểm tra đăng nhập

const ProductListPage: React.FC = () => {
  // State để lưu danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState<boolean>(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState<string | null>(null);
  const { addToCart, state: cartState } = useCart(); // <<< Lấy hàm addToCart và state từ CartContext
  const { state: authState } = useAuth(); // Lấy trạng thái đăng nhập

  // useEffect sẽ chạy một lần sau khi component render lần đầu
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // Bắt đầu loading
        setError(null);   // Xóa lỗi cũ
        const data = await getProducts(); // Gọi API
        setProducts(data); // Cập nhật state với dữ liệu nhận được
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.'); // Set lỗi
        console.error(err);
      } finally {
        setLoading(false); // Kết thúc loading dù thành công hay thất bại
      }
    };

    fetchProducts(); // Gọi hàm fetch data
  }, []); // Mảng rỗng [] nghĩa là effect này chỉ chạy 1 lần

   const handleAddToCart = async (productId: string) => {
       if (!authState.isAuthenticated) {
           alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
           // Có thể chuyển hướng đến trang login: navigate('/login');
           return;
       }
       try {
           await addToCart(productId, 1); // Mặc định thêm 1 sản phẩm
           alert('Đã thêm sản phẩm vào giỏ hàng!');
       } catch (err: any) {
           alert(`Lỗi: ${err.message || 'Không thể thêm vào giỏ hàng'}`);
       }
   };

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div style={{ color: 'red' }}>Lỗi: {error}</div>;

  return (
    <div>
      <h2>Danh sách Sản phẩm</h2>
      {/* Hiển thị số lượng item trong giỏ ở đây nếu muốn */}
      <p>Số sản phẩm trong giỏ: {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString('vi-VN')} VNĐ</p>
            <p>Kho: {product.stockQuantity}</p>
            {/* Gọi handleAddToCart khi nhấn nút */}
            <button onClick={() => handleAddToCart(product.id)} disabled={cartState.isLoading}>
                {cartState.isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;