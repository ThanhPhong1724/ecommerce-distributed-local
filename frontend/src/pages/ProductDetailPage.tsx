import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById, Product } from '../services/productApi';
import { useCart } from '../contexts/CartContext';
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiRepeat, FiTag } from 'react-icons/fi';

// Mock data cho các thông tin bổ sung
const additionalInfo = {
  highlights: [
    "Chất liệu cao cấp",
    "Thiết kế hiện đại",
    "Phù hợp mọi dịp",
    "Dễ dàng phối đồ"
  ],
  specifications: [
    { label: "Chất liệu", value: "Cotton 100%" },
    { label: "Xuất xứ", value: "Việt Nam" },
    { label: "Mẫu", value: "Trơn" },
    { label: "Kiểu dáng", value: "Regular fit" }
  ],
  shipping: [
    "Miễn phí vận chuyển cho đơn hàng trên 500K",
    "Giao hàng nhanh 2-3 ngày",
    "Đổi trả trong 7 ngày"
  ]
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

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

  const mockImages = [
    product?.img,
    'https://image.hm.com/assets/hm/e2/56/e256e588640ab0e04f5552c32fb343511c99beac.jpg?imwidth=1260',
    'https://image.hm.com/assets/hm/96/e8/96e83e1c2a4b6b1c4b477fd4227be680fafc0806.jpg?imwidth=2160'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10">{error}</div>
        ) : product ? (
          <>
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
              {/* Image Gallery */}
              <div className="sticky top-8">
                <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-white">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={mockImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {mockImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        selectedImage === idx ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="mt-8 lg:mt-0">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                
                <div className="mt-4 flex items-center">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    Bestseller
                  </div>
                  <div className="ml-4 text-sm text-gray-500">
                    Đã bán: 1.2k+ sản phẩm
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-4xl font-bold text-purple-600">
                    {product.price.toLocaleString('vi-VN')}₫
                  </h2>
                  <div className="mt-2 text-sm text-gray-500">
                    Tiết kiệm: 120.000₫ (20%) so với giá thị trường
                  </div>
                </div>

                {/* Stock and Quantity */}
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Kho hàng:</span>
                    <span className={`font-medium ${
                      product.stockQuantity > 10 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      Còn {product.stockQuantity} sản phẩm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Số lượng:</span>
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 disabled:text-gray-400"
                      >
                        <FiMinus />
                      </motion.button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                        min="1"
                        max={product.stockQuantity}
                        className="w-16 text-center border-0 focus:ring-0"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                        disabled={quantity >= product.stockQuantity}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 disabled:text-gray-400"
                      >
                        <FiPlus />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-full border border-gray-200 hover:border-purple-400 text-gray-600"
                  >
                    <FiHeart className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-full border border-gray-200 hover:border-purple-400 text-gray-600"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Benefits */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: <FiTruck />, text: "Miễn phí vận chuyển" },
                    { icon: <FiShield />, text: "Bảo hành 12 tháng" },
                    { icon: <FiRepeat />, text: "Đổi trả 7 ngày" },
                    { icon: <FiTag />, text: "Giá tốt nhất" }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      {benefit.icon}
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-16">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                  {[
                    { id: 'description', label: 'Mô tả' },
                    { id: 'specifications', label: 'Thông số' },
                    { id: 'shipping', label: 'Vận chuyển' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-sm font-medium relative ${
                        activeTab === tab.id
                          ? 'text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'description' && (
                      <div className="prose max-w-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Điểm nổi bật
                            </h3>
                            <ul className="space-y-2">
                              {additionalInfo.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-600">
                                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Mô tả chi tiết
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {additionalInfo.specifications.map((spec, idx) => (
                          <div key={idx} className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">{spec.label}</span>
                            <span className="font-medium text-gray-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'shipping' && (
                      <div className="space-y-4">
                        {additionalInfo.shipping.map((info, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <FiTruck className="w-5 h-5 text-purple-600 mt-1" />
                            <p className="text-gray-600">{info}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">Không tìm thấy sản phẩm</div>
        )}
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