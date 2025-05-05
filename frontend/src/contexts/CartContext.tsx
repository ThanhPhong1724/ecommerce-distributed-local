// src/contexts/CartContext.tsx
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
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
  imageUrl?: string;
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

// Tạo Context
interface CartContextProps {
  state: CartState;
  // Các hàm để tương tác với giỏ hàng (thay vì dispatch trực tiếp)
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Tạo Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth(); // Lấy trạng thái auth để biết user là ai

  // Hàm gọi API để lấy giỏ hàng
  const fetchCart = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user?.id) {
       console.log("User not authenticated, cannot fetch cart");
       dispatch({ type: 'LOAD_CART_SUCCESS', payload: [] }); // Reset giỏ hàng nếu ko đăng nhập
       return;
    }
    dispatch({ type: 'LOAD_CART_START' });
    try {
      // Truyền userId vào hàm getCart (hoặc để cartApi tự lấy từ token nếu có)
      const cartData = await getCart(authState.user.id); // <<< Cần userId
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: cartData.items });
    } catch (error: any) {
      dispatch({ type: 'LOAD_CART_FAILURE', payload: error.message || 'Lỗi tải giỏ hàng' });
    }
  }, [authState.isAuthenticated, authState.user?.id]); // Phụ thuộc vào trạng thái đăng nhập

  // // Load giỏ hàng khi user đăng nhập hoặc component mount lần đầu
  // useEffect(() => {
  //   fetchCart();
  // }, [fetchCart]); // Gọi fetchCart khi nó thay đổi (tức là khi user đăng nhập/đăng xuất)

  useEffect(() => {
    if (authState.isAuthenticated) { // <<< Chỉ fetch khi đã đăng nhập
        console.log("User is authenticated, fetching cart...");
        fetchCart();
    } else {
        console.log("User not authenticated, clearing local cart state.");
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: [] }); // Đảm bảo reset state khi logout
    }
  }, [fetchCart, authState.isAuthenticated]); // <<< Thêm authState.isAuthenticated vào dependency array

  // Hàm thêm sản phẩm
  const addToCart = async (productId: string, quantity: number) => {
     if (!authState.isAuthenticated || !authState.user?.id) throw new Error("Bạn cần đăng nhập để thêm vào giỏ hàng");
     dispatch({ type: 'ADD_ITEM_START' });
     try {
         // Truyền userId vào hàm addItemToCart
         const updatedCart = await addItemToCart(authState.user.id, productId, quantity); // <<< Cần userId
         dispatch({ type: 'ADD_ITEM_SUCCESS', payload: updatedCart.items });
     } catch (error: any) {
         dispatch({ type: 'ADD_ITEM_FAILURE', payload: error.message || 'Lỗi thêm vào giỏ hàng' });
         throw error; // Ném lỗi ra để component báo cho user
     }
  };

   // Hàm cập nhật số lượng
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!authState.isAuthenticated || !authState.user?.id) throw new Error("Lỗi xác thực");
    if (quantity <= 0) { // Nếu số lượng <= 0 thì xóa luôn
         await removeFromCart(productId);
         return;
    }
    dispatch({ type: 'UPDATE_ITEM_START' });
    try {
        const updatedCart = await updateCartItemQuantity(authState.user.id, productId, quantity); // <<< Cần userId
        dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: updatedCart.items });
    } catch (error: any) {
        dispatch({ type: 'UPDATE_ITEM_FAILURE', payload: error.message || 'Lỗi cập nhật giỏ hàng' });
        throw error;
    }
  };

  // Hàm xóa sản phẩm
  const removeFromCart = async (productId: string) => {
    if (!authState.isAuthenticated || !authState.user?.id) throw new Error("Lỗi xác thực");
    dispatch({ type: 'REMOVE_ITEM_START' });
    try {
        const updatedCart = await removeItemFromCart(authState.user.id, productId); // <<< Cần userId
        dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: updatedCart.items });
    } catch (error: any) {
        dispatch({ type: 'REMOVE_ITEM_FAILURE', payload: error.message || 'Lỗi xóa sản phẩm' });
        throw error;
    }
  };

   // Hàm xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!authState.isAuthenticated || !authState.user?.id) throw new Error("Lỗi xác thực");
    dispatch({ type: 'CLEAR_CART_START' });
    try {
        await clearCartApi(authState.user.id); // <<< Cần userId
        dispatch({ type: 'CLEAR_CART_SUCCESS' });
    } catch (error: any) {
        dispatch({ type: 'CLEAR_CART_FAILURE', payload: error.message || 'Lỗi xóa giỏ hàng' });
        throw error;
    }
  };


  return (
    <CartContext.Provider value={{ state, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};