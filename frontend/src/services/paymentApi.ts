// src/services/paymentApi.ts
import apiClient from './apiClient';

// Interface cho dữ liệu gửi đi khi tạo URL thanh toán
interface CreatePaymentUrlPayload {
  orderId: string;
  amount: number;
  orderDescription: string;
  bankCode?: string;
  language?: string;
  vnp_ResponseCode?: string; // Thêm trường này
}

// Interface cho dữ liệu trả về (chứa URL)
interface CreatePaymentUrlResponse {
  url: string;
}

export const createPaymentUrl = async (payload: CreatePaymentUrlPayload): Promise<CreatePaymentUrlResponse> => {
  try {
    // Gọi POST /api/payment/create_payment_url
    const response = await apiClient.post<CreatePaymentUrlResponse>('/payment/create_payment_url', payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo URL thanh toán:", error);
    if (error instanceof Error && 'response' in error && (error as any).response?.data) {
        throw (error as any).response.data;
      }
      throw error;
  }
};