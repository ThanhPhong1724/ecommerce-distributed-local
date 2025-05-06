// src/services/orderApi.ts
import apiClient from './apiClient';

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