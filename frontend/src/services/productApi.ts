// src/services/productApi.ts
import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu Product (nên giống backend hoặc tạo interface chung)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string; // Frontend sẽ sử dụng imageUrl
  categoryId: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<any[]>('/products');
    return response.data.map(product => ({
      ...product,
      imageUrl: product.img // Map từ img sang imageUrl
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await apiClient.get<any>(`/products/${id}`);
    return {
      ...response.data,
      imageUrl: response.data.img // Map từ img sang imageUrl
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Thêm các hàm gọi API khác cho product (getById, create, update...) sau này