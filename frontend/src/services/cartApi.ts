// src/services/cartApi.ts
import apiClient from './apiClient';
import { CartItem } from '../contexts/CartContext'; // Import kiểu CartItem

// Kiểu dữ liệu trả về của các API cart
interface CartApiResponse {
    userId: string;
    items: CartItem[];
}

// Lấy giỏ hàng
export const getCart = async (): Promise<CartApiResponse> => {
  try {
    // Không cần userId nữa vì đã có trong token
    const response = await apiClient.get<CartApiResponse>('/cart');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Lỗi không xác định khi lấy giỏ hàng');
  }
};

// Thêm item vào giỏ
export const addItemToCart = async (productId: string, quantity: number): Promise<CartApiResponse> => {
  try {
    const response = await apiClient.post<CartApiResponse>('/cart/items', { 
      productId, 
      quantity 
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    throw error;
  }
};

// Cập nhật số lượng
export const updateCartItemQuantity = async (productId: string, quantity: number): Promise<CartApiResponse> => {
  try {
    const response = await apiClient.put<CartApiResponse>(`/cart/items/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    if (error instanceof Error) {
      throw error.message;
    }
    throw error;
  }
};

// Xóa item khỏi giỏ
export const removeItemFromCart = async (productId: string): Promise<CartApiResponse> => {
  try {
    const response = await apiClient.delete<CartApiResponse>(`/cart/items/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    if (error instanceof Error) {
      throw error.message;
    }
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCartApi = async (): Promise<void> => {
  try {
    await apiClient.delete('/cart');
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    throw error;
  }
};