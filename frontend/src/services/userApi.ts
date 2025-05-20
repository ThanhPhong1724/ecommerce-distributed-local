// src/services/userApi.ts
import apiClient from './apiClient';
import { UserRole } from '../contexts/AuthContext'; // Hoặc từ file interface chung
import axios, { AxiosError } from 'axios'; // <<< Import AxiosError

export interface AdminUserPayload { // Interface cho dữ liệu user mà admin xem
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const getAllUsersForAdmin = async (): Promise<AdminUserPayload[]> => {
  try {
    const response = await apiClient.get<AdminUserPayload[]>('/users/admin/all');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users cho admin:", error);

    // --- SỬA LỖI Ở ĐÂY ---
    if (axios.isAxiosError(error)) { // Kiểm tra xem có phải là lỗi từ Axios không
      const axiosError = error as AxiosError<any>; // Ép kiểu để truy cập response
      // Ném lỗi với thông tin từ backend nếu có, hoặc message của AxiosError
      throw axiosError.response?.data || axiosError;
    } else if (error instanceof Error) { // Nếu là lỗi JavaScript thông thường
      throw error;
    } else { // Trường hợp lỗi không xác định
      throw new Error('Lỗi không xác định khi lấy danh sách người dùng.');
    }
    // --- KẾT THÚC SỬA LỖI ---
  }
}