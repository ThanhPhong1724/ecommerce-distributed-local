// src/services/apiClient.ts
import axios from 'axios';

// Lấy Base URL từ biến môi trường (đặt trong frontend/.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

console.log('API Base URL:', API_BASE_URL); // Kiểm tra xem có đọc đúng không

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor để tự động thêm token vào header ---
// Chúng ta sẽ thêm logic này sau khi có phần Authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;