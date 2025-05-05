// src/services/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Make sure this key 'accessToken' EXACTLY matches the key used in localStorage.setItem
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Interceptor: Gắn token vào header:', config.headers.Authorization); // Add log
    } else {
        console.log('Interceptor: Không tìm thấy token trong localStorage.'); // Add log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor for handling 401 globally (e.g., logout user)
apiClient.interceptors.response.use(
  (response) => response, // Do nothing on successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Lỗi 401 Unauthorized từ interceptor:", error.response);
      // Optional: Clear token and redirect to login
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login'; // Or use react-router navigate
      // alert("Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
    }
    return Promise.reject(error); // Important to reject the error so component's catch block works
  }
);


export default apiClient;