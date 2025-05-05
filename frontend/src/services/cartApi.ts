// src/services/cartApi.ts
import apiClient from './apiClient';
import { CartItem } from '../contexts/CartContext'; // Import kiểu CartItem

// Kiểu dữ liệu trả về của các API cart
interface CartApiResponse {
    userId: string;
    items: CartItem[];
}

// Lấy giỏ hàng
export const getCart = async (userId: string): Promise<CartApiResponse> => {
  try {
    const response = await apiClient.get<CartApiResponse>(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    if (error instanceof Error) {
      throw error.message; // Ép kiểu và trả về thông báo lỗi
    }
    throw error; // Nếu không phải kiểu Error, ném lỗi gốc
  }
};

// Thêm item vào giỏ
export const addItemToCart = async (userId: string, productId: string, quantity: number): Promise<CartApiResponse> => {
  try {
    const response = await apiClient.post<CartApiResponse>(`/cart/items`, { productId, quantity });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    if (error instanceof Error) {
      throw error.message;
    }
    throw error;
  }
};

// Cập nhật số lượng
export const updateCartItemQuantity = async (userId: string, productId: string, quantity: number): Promise<CartApiResponse> => {
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
export const removeItemFromCart = async (userId: string, productId: string): Promise<CartApiResponse> => {
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
export const clearCartApi = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/cart/${userId}`);
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    if (error instanceof Error) {
      throw error.message;
    }
    throw error;
  }
};