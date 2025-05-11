// src/pages/ProductListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
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
    <div className="product-list">
      <h2>Danh sách Sản phẩm</h2>
      <p>Số sản phẩm trong giỏ: {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {/* Wrap image and name in Link */}
            <Link to={`/products/${product.id}`} className="product-link">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <h3 className="product-name">{product.name}</h3>
            </Link>
            <p className="product-price">{product.price.toLocaleString('vi-VN')} VNĐ</p>
            <p className="stock-info">Còn lại: {product.stockQuantity}</p>
            <button 
              onClick={() => handleAddToCart(product.id)} 
              disabled={cartState.isLoading}
              className="add-to-cart-btn"
            >
              {cartState.isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .product-list {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px 0;
        }

        .product-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-image img:hover {
          transform: scale(1.05);
        }

        .product-name {
          font-size: 1.1rem;
          margin: 8px 0;
          color: #333;
        }

        .product-price {
          font-size: 1.2rem;
          font-weight: bold;
          color: #e53935;
          margin: 8px 0;
        }

        .stock-info {
          color: #666;
          font-size: 0.9rem;
          margin: 8px 0;
        }

        .add-to-cart-btn {
          margin-top: auto;
          padding: 10px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-to-cart-btn:hover {
          background: #45a049;
        }

        .add-to-cart-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ProductListPage;