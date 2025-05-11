import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, Product } from '../services/productApi';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error('ID sản phẩm không hợp lệ');
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      if (!product) return;
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="product-detail">
      <div className="product-layout">
        <div className="product-image">
          <img src={product.imageUrl} alt={product.name} />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toLocaleString('vi-VN')}đ</p>
          <p className="description">{product.description}</p>
          <div className="stock-info">
            <span>Còn lại: {product.stockQuantity} sản phẩm</span>
          </div>
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
              min="1"
              max={product.stockQuantity}
            />
            <button 
              onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
              disabled={quantity >= product.stockQuantity}
            >
              +
            </button>
          </div>
          <button 
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
          >
            {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
      <style>{`
        .product-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .product-image img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .price {
          font-size: 24px;
          font-weight: bold;
          color: #e53935;
        }
        .description {
          line-height: 1.6;
          color: #666;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quantity-selector button {
          padding: 5px 10px;
          font-size: 18px;
        }
        .quantity-selector input {
          width: 60px;
          text-align: center;
          padding: 5px;
        }
        .add-to-cart {
          padding: 15px 30px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .add-to-cart:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;