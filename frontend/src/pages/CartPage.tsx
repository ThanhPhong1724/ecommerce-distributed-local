// src/pages/CartPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiMinus, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateQuantity, removeFromCart } = useCart();
  const { isLoading, items, error } = state;

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

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Đã xảy ra lỗi</div>
          <p className="text-gray-600">{error}</p>
          <Link to="/products" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-200"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 flex items-center gap-6 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                      <img 
                        src={item.img || 'placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.name || item.productId}
                      </h3>
                      <div className="text-sm text-gray-500 mb-4">
                        SKU: {item.productId}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-full">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600 disabled:text-gray-400"
                            data-testid={`cart-decrease-quantity-button-${item.productId}`} 
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)}
                            min="1"
                            className="w-12 text-center border-0 focus:ring-0"
                            data-testid={`cart-quantity-input-${item.productId}`} 
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600 disabled:text-gray-400"
                            data-testid={`cart-increase-quantity-button-${item.productId}`} 
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-purple-600">
                            {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            data-testid={`remove-cart-item-button-${item.productId}`}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Tổng giỏ hàng</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <span>Tổng cộng</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                disabled={isLoading || items.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span>Tiến hành đặt hàng</span>
                <FiArrowRight className="w-5 h-5" />
              </motion.button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm text-purple-600 hover:text-purple-700"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;