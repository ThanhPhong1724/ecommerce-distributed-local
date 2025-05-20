// src/contexts/CartContext.tsx
import React, { createContext, useReducer, useContext, useEffect, useCallback, useState } from 'react';
import { debounce } from 'lodash';
import { addItemToCart, getCart, removeItemFromCart, updateCartItemQuantity, clearCartApi } from '../services/cartApi'; // API calls
import { useAuth } from './AuthContext'; // Lấy thông tin user

// Định nghĩa kiểu dữ liệu cho một item trong giỏ hàng
export interface CartItem {
  productId: string;
  quantity: number;
  // Thêm các thông tin khác từ Product nếu cần hiển thị trong giỏ (name, price, imageUrl)
  // Những thông tin này thường được lấy khi hiển thị, không nhất thiết lưu hết trong Cart state
  name?: string;
  price?: number;
  img?: string;
}

// Định nghĩa kiểu dữ liệu cho trạng thái Cart
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

// Định nghĩa các Actions
type CartAction =
  | { type: 'LOAD_CART_START' }
  | { type: 'LOAD_CART_SUCCESS'; payload: CartItem[] }
  | { type: 'LOAD_CART_FAILURE'; payload: string }
  | { type: 'ADD_ITEM_START' } // Để xử lý loading khi thêm
  | { type: 'ADD_ITEM_SUCCESS'; payload: CartItem[] } // Cập nhật lại toàn bộ giỏ hàng sau khi thêm thành công
  | { type: 'ADD_ITEM_FAILURE'; payload: string }
  | { type: 'UPDATE_ITEM_START' }
  | { type: 'UPDATE_ITEM_SUCCESS'; payload: CartItem[] }
  | { type: 'UPDATE_ITEM_FAILURE'; payload: string }
  | { type: 'REMOVE_ITEM_START' }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: CartItem[] }
  | { type: 'REMOVE_ITEM_FAILURE'; payload: string }
  | { type: 'CLEAR_CART_START' }
  | { type: 'CLEAR_CART_SUCCESS' }
  | { type: 'CLEAR_CART_FAILURE'; payload: string };

// Trạng thái khởi tạo
const initialState: CartState = {
  items: [],
  isLoading: false, // Ban đầu không loading
  error: null,
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART_START':
    case 'ADD_ITEM_START':
    case 'UPDATE_ITEM_START':
    case 'REMOVE_ITEM_START':
    case 'CLEAR_CART_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_CART_SUCCESS':
    case 'ADD_ITEM_SUCCESS':
    case 'UPDATE_ITEM_SUCCESS':
    case 'REMOVE_ITEM_SUCCESS':
      return { ...state, isLoading: false, items: action.payload, error: null };
    case 'CLEAR_CART_SUCCESS':
       return { ...state, isLoading: false, items: [], error: null };
    case 'LOAD_CART_FAILURE':
    case 'ADD_ITEM_FAILURE':
    case 'UPDATE_ITEM_FAILURE':
    case 'REMOVE_ITEM_FAILURE':
    case 'CLEAR_CART_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

interface CartContextProps {
  state: CartState;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();

  // Thêm flag để tránh fetch nhiều lần
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedFetchCart = useCallback(
    debounce(async () => {
      if (!authState.isAuthenticated) {
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: [] });
        return;
      }
      dispatch({ type: 'LOAD_CART_START' });
      try {
        const cartData = await getCart();
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: cartData.items });
      } catch (error: any) {
        dispatch({ type: 'LOAD_CART_FAILURE', payload: error.message || 'Lỗi tải giỏ hàng' });
      }
    }, 300),
    [authState.isAuthenticated]
  );

  // Wrapper to ensure return type is always Promise<void>
  const fetchCart = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      debouncedFetchCart();
      resolve();
    });
  }, [debouncedFetchCart]);

  useEffect(() => {
    if (authState.isAuthenticated && isInitialLoad) {
      setIsInitialLoad(false);
      fetchCart();
    }
  }, [fetchCart, authState.isAuthenticated, isInitialLoad]);

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    if (!authState.isAuthenticated) throw new Error("Bạn cần đăng nhập để thêm vào giỏ hàng");
    dispatch({ type: 'ADD_ITEM_START' });
    try {
      const updatedCart = await addItemToCart(productId, quantity);
      dispatch({ type: 'ADD_ITEM_SUCCESS', payload: updatedCart.items });
    } catch (error: any) {
      dispatch({ type: 'ADD_ITEM_FAILURE', payload: error.message || 'Lỗi thêm vào giỏ hàng' });
      throw error;
    }
  }, [authState.isAuthenticated]); // Dependency: authState.isAuthenticated

  const removeFromCart = useCallback(async (productId: string) => { // Đưa removeFromCart lên trước updateQuantity
    if (!authState.isAuthenticated) throw new Error("Bạn cần đăng nhập để xóa sản phẩm");
    dispatch({ type: 'REMOVE_ITEM_START' });
    try {
      const updatedCart = await removeItemFromCart(productId);
      dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: updatedCart.items });
    } catch (error: any) {
      dispatch({ type: 'REMOVE_ITEM_FAILURE', payload: error.message || 'Lỗi xóa sản phẩm' });
      throw error;
    }
  }, [authState.isAuthenticated]); // Dependency: authState.isAuthenticated

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!authState.isAuthenticated) throw new Error("Lỗi xác thực"); // Bỏ user.id vì đã có token
    if (quantity <= 0) {
         await removeFromCart(productId); // Gọi hàm removeFromCart đã được memoize
         return;
    }
    dispatch({ type: 'UPDATE_ITEM_START' });
    try {
        const updatedCart = await updateCartItemQuantity(productId, quantity);
        dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: updatedCart.items });
    } catch (error: any) {
        dispatch({ type: 'UPDATE_ITEM_FAILURE', payload: error.message || 'Lỗi cập nhật giỏ hàng' });
        throw error;
    }
  }, [authState.isAuthenticated, removeFromCart]); // Dependencies: authState.isAuthenticated, removeFromCart

  const clearCart = useCallback(async () => {
    if (!authState.isAuthenticated) throw new Error("Bạn cần đăng nhập để xóa giỏ hàng");
    dispatch({ type: 'CLEAR_CART_START' });
    try {
      await clearCartApi();
      dispatch({ type: 'CLEAR_CART_SUCCESS' });
    } catch (error: any) {
      dispatch({ type: 'CLEAR_CART_FAILURE', payload: error.message || 'Lỗi xóa giỏ hàng' });
      throw error; // Ném lỗi để component gọi có thể bắt nếu cần
    }
  }, [authState.isAuthenticated]); // Dependency: authState.isAuthenticated

  return (
    <CartContext.Provider value={{ state, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};