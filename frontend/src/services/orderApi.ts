// src/services/orderApi.ts
import apiClient from './apiClient';
import axios from 'axios';

// Interface cho dữ liệu gửi đi khi tạo order
interface CreateOrderPayload {
  shippingAddress: string;
  orderItems: Array<{  // Changed from 'items' to 'orderItems'
    productId: string;
    quantity: number;
    price: number;
  }>;
}

// Interface cho dữ liệu order trả về từ backend
// Nên import từ file interface chung nếu có
interface OrderResponse {
  id: string;
  userId: string;
  status: string; // Hoặc dùng enum OrderStatus
  totalAmount: number;
  items: { productId: string; quantity: number; price: number; name: string }[];
  shippingAddress: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<OrderResponse> => {
  try {
    // Log đầy đủ payload để debug
    console.log('Creating order with payload:', JSON.stringify(payload, null, 2));
    
    // Add explicit header setting
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post<OrderResponse>('/orders', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Order creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Order creation failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
      payload: payload // Log payload khi có lỗi
    });
    
    // Thêm chi tiết lỗi
    if (error.response?.data?.message) {
      throw new Error(Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message
      );
    }
    
    throw error;
  }
};

// Thêm các hàm gọi API khác cho order (getOrders, getOrderById...) sau
// Định nghĩa kiểu dữ liệu cho một item trong đơn hàng
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string; // Giữ dạng string như API trả về, sẽ format sau
  productName: string;
  orderId: string;
  productImage?: string | null; // Thêm trường này
}

// Định nghĩa kiểu dữ liệu cho chi tiết đơn hàng
export interface OrderDetail {
  id: string;
  userId: string;
  status: string; // 'pending', 'processing', 'completed', 'failed', etc.
  totalAmount: string; // Giữ dạng string, sẽ format sau
  items: OrderItem[];
  shippingAddress: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export const getOrderDetails = async (orderId: string): Promise<OrderDetail> => {
  try {
    const response = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for orderId ${orderId}:`, error);
    // Ném lỗi để component có thể bắt và xử lý
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

// Thêm interface cho danh sách đơn hàng
export interface OrderListItem {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  shippingAddress: string;
  itemCount: number;
}

// Thêm hàm lấy danh sách đơn hàng
export const getOrders = async (): Promise<OrderListItem[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
    }

    // Endpoint sẽ là http://localhost/api/orders
    const response = await apiClient.get<OrderListItem[]>('/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Orders response:', response.data); // Thêm log để debug
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error); // Thêm log để debug
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy lịch sử đơn hàng');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
    }
    throw error;
  }
};