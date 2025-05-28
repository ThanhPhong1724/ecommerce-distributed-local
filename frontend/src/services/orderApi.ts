// src/services/orderApi.ts
import apiClient from './apiClient';
import axios, { AxiosError } from 'axios'; // Import AxiosError

// Interface cho dữ liệu gửi đi khi tạo order
interface CreateOrderPayload {
  shippingAddress: string;
  orderItems: Array<{  // Changed from 'items' to 'orderItems'
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export enum OrderStatusApi { // Đặt tên khác để tránh trùng với OrderStatus của backend nếu cần
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}
export interface OrderItemData {
  id?: string; // ID của order item (nếu backend trả về)
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null; // Thêm nếu có
}

// Interface này nên khớp với dữ liệu mà backend API /orders/admin/all và /orders/admin/:id trả về
export interface OrderData {
  id: string;
  userId: string;
  status: OrderStatusApi; // Sử dụng enum
  totalAmount: number;
  items: OrderItemData[];
  shippingAddress: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: { // Thông tin user (nếu backend API admin có join và trả về)
    email: string;
    firstName?: string;
    lastName?: string;
  };
  // adminNotes?: string; // Nếu admin có thể thêm ghi chú
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

// --- HÀM API CHO ADMIN ---
export const getAllOrdersForAdmin = async (
  // Thêm params cho phân trang, lọc sau này nếu cần
  // params?: { page?: number; limit?: number; status?: OrderStatusApi; search?: string }
): Promise<OrderData[]> => {
  try {
    const response = await apiClient.get<OrderData[]>('/orders/admin/all' /*, { params }*/);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng cho admin:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};

/**
 * Lấy chi tiết một đơn hàng cho Admin.
 */
export const getOrderByIdForAdmin = async (orderId: string): Promise<OrderData> => {
    try {
        const response = await apiClient.get<OrderData>(`/orders/admin/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId} cho admin:`, error);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<any>;
          throw axiosError.response?.data || axiosError;
        }
        throw error;
    }
};

/**
 * Interface cho payload khi Admin cập nhật chi tiết đơn hàng.
 * Nên trùng với UpdateOrderAdminDto ở backend.
 */
export interface UpdateOrderAdminPayload {
  shippingAddress?: string;
  status?: OrderStatusApi;
}

/**
 * Admin cập nhật chi tiết đơn hàng (địa chỉ, trạng thái...).
 */
export const updateOrderDetailsForAdmin = async (
  orderId: string,
  payload: UpdateOrderAdminPayload
): Promise<OrderData> => {
  try {
    const response = await apiClient.patch<OrderData>(`/orders/admin/${orderId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật đơn hàng ${orderId} cho admin:`, error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};

/**
 * Admin hủy một đơn hàng (thực chất là cập nhật trạng thái thành CANCELLED).
 * Có thể dùng lại updateOrderDetailsForAdmin hoặc tạo hàm riêng cho rõ ràng.
 */
export const cancelOrderForAdmin = async (orderId: string): Promise<OrderData> => {
  try {
    // Gọi API PATCH /admin/:orderId/status hoặc PATCH /admin/:orderId với payload status
    // Ví dụ dùng lại hàm updateOrderDetailsForAdmin:
    return await updateOrderDetailsForAdmin(orderId, { status: OrderStatusApi.CANCELLED });

    // Hoặc nếu backend có endpoint riêng cho cancel:
    // const response = await apiClient.delete<OrderData>(`/orders/admin/${orderId}/cancel`); // Giả sử dùng DELETE
    // return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy đơn hàng ${orderId} cho admin:`, error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};
