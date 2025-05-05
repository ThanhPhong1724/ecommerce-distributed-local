// src/services/productApi.ts
import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu Product (nên giống backend hoặc tạo interface chung)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string; // Giả sử có trường này
  category?: { id: string; name: string }; // Category có thể có hoặc không
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/products'); // Gọi đến /api/products
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    throw error; // Ném lỗi để component xử lý
  }
};

// Thêm các hàm gọi API khác cho product (getById, create, update...) sau này