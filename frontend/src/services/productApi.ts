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
// Interface cho payload admin (có thể giống Product hoặc tùy chỉnh)
export type AdminProductPayload = Product; // Hiện tại dùng chung kiểu Product

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

// --- CÁC HÀM API CHO ADMIN ---
export const getProductByIdForAdmin = async (id: string): Promise<AdminProductPayload> => {
  try {
    const response = await apiClient.get<any>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Kiểu dữ liệu cho payload tạo/update product (không bao gồm id, createdAt, updatedAt, category object)
type ProductFormData = Omit<AdminProductPayload, 'id' | 'createdAt' | 'updatedAt' | 'category'>;

export const createProductForAdmin = async (productData: ProductFormData): Promise<AdminProductPayload> => {
  try {
    const response = await apiClient.post<AdminProductPayload>('/products', productData); // Giả sử dùng lại POST /products
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};


export const updateProductForAdmin = async (productId: string, productData: ProductFormData): Promise<AdminProductPayload> => {
  try {
      // API này cần được bảo vệ bởi AdminGuard ở backend
      const response = await apiClient.patch<AdminProductPayload>(`/products/${productId}`, productData); // Giả sử dùng lại PATCH /products/:id
      return response.data;
    } catch (error) {
    console.error('Lỗi update sản phẩm:', error);
    throw error;
  }
};

export const deleteProductForAdmin = async (productId: string): Promise<void> => {
  try {
      await apiClient.delete(`/products/${productId}`); // Giả sử dùng lại DELETE /products/:id
    } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    throw error;
  }
};
// Thêm các hàm gọi API khác cho product (getById, create, update...) sau này