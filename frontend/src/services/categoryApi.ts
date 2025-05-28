import apiClient from './apiClient';

export interface Category {
  id: string;
  name: string;
  description: string;
  img: string;  // Đảm bảo có field này trong database
  createdAt: string;
  updatedAt: string;
}

// Interface cho DTO tạo category (chỉ cần name, description)
export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
}

// Interface cho DTO cập nhật category
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;


export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        // Giả sử API lấy danh mục của user thường cũng dùng được cho admin dropdown
        const response = await apiClient.get<Category[]>('/categories');
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        throw error;
    }
};

// --- CÁC HÀM API CHO ADMIN ---
export const createCategoryForAdmin = async (payload: CreateCategoryPayload): Promise<Category> => {
  try {
    // API này cần được bảo vệ bởi AdminGuard ở backend (POST /categories)
    const response = await apiClient.post<Category>('/categories', payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục cho admin:", error);
    throw error;
  }
};

export const updateCategoryForAdmin = async (categoryId: string, payload: UpdateCategoryPayload): Promise<Category> => {
  try {
    // API này cần được bảo vệ bởi AdminGuard ở backend (PATCH /categories/:id)
    const response = await apiClient.patch<Category>(`/categories/${categoryId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật danh mục ${categoryId} cho admin:`, error);
    throw error;
  }
};

export const deleteCategoryForAdmin = async (categoryId: string): Promise<void> => {
  try {
    // API này cần được bảo vệ bởi AdminGuard ở backend (DELETE /categories/:id)
    await apiClient.delete(`/categories/${categoryId}`);
  } catch (error) {
    console.error(`Lỗi khi xóa danh mục ${categoryId} cho admin:`, error);
    throw error;
  }
};