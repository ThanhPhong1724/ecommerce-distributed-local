// src/services/productApi.ts
import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu Product (nên giống backend hoặc tạo interface chung)
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  img: string; // Changed from imageUrl to img to match database
  category?: {
    id: string;
    name: string;
  };
  categoryId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await apiClient.get<any[]>(`/products/category/${categoryId}`);
    return response.data.map(product => ({
      ...product,
      imageUrl: product.img // Map từ img sang imageUrl
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Thêm các hàm gọi API khác cho product (getById, create, update...) sau này