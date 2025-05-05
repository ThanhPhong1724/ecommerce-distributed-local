// src/pages/ProductListPage.tsx
import React, { useState, useEffect } from 'react';
import { getProducts, Product } from '../services/productApi'; // Import hàm và kiểu

const ProductListPage: React.FC = () => {
  // State để lưu danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState<boolean>(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState<string | null>(null);

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

  // --- Render giao diện ---
  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Lỗi: {error}</div>;
  }

  return (
    <div>
      <h2>Danh sách Sản phẩm</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products.length === 0 ? (
          <p>Không có sản phẩm nào.</p>
        ) : (
          products.map((product) => (
            // TODO: Tạo component ProductCard để hiển thị đẹp hơn
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
              {/* Giả sử có imageUrl */}
              {/* <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%' }} /> */}
              <h3>{product.name}</h3>
              <p>{product.price.toLocaleString('vi-VN')} VNĐ</p>
              <p>Kho: {product.stockQuantity}</p>
              {/* TODO: Thêm nút "Thêm vào giỏ" */}
              <button>Thêm vào giỏ</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductListPage;