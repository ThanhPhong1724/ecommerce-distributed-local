// src/services/authApi.ts
import apiClient from './apiClient';
import { UserRole } from '../contexts/AuthContext';

// Định nghĩa kiểu trả về của API login (có token)
interface LoginResponse {
  access_token: string;
  // Có thể backend trả về thêm thông tin user ở đây
}

// Định nghĩa kiểu trả về của API profile
interface ProfileResponse {
    userId: string;
    email: string;
    role: UserRole; // <<< THÊM ROLE VÀO ĐÂY
    // Thêm các trường khác nếu API profile trả về
}

// Định nghĩa kiểu dữ liệu gửi đi khi đăng ký
interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  
  // Định nghĩa kiểu trả về của API register (thường là thông tin user đã tạo)
  interface RegisterResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    // ...
  }

  
export const loginUser = async (credentials: {email: string, password: string}): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials); // Gọi POST /api/auth/login
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    // Ném lỗi để component xử lý hiển thị thông báo
    if (error instanceof Error && (error as any).response?.data) {
        throw (error as any).response.data; // Trả về lỗi từ backend nếu có
    }
    throw error; // Ném lỗi gốc nếu không phải lỗi từ backend
  }
};

// Hàm lấy thông tin user sau khi đăng nhập (dùng token)
export const getUserProfile = async (): Promise<ProfileResponse> => {
    try {
        const response = await apiClient.get<ProfileResponse>('/users/profile'); // Gọi GET /api/users/profile
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        if (error instanceof Error && (error as any).response?.data) {
            throw (error as any).response.data;
        }
        throw error;
    }
};

// Thêm hàm registerUser sau
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
    try {
        const response = await apiClient.post<RegisterResponse>('/users', data); // Gọi POST /api/users
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        if (error instanceof Error && (error as any).response?.data) {
            throw (error as any).response.data;
        }
        throw error;
    }
};