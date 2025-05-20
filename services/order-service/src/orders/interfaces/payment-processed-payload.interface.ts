// src/notifications/interfaces/payment-processed-payload.interface.ts
export enum PaymentNotificationStatus { // Có thể dùng enum riêng cho notification nếu cần phân biệt
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface PaymentProcessedPayloadDTO {
  orderId: string;
  userId: string; // Bắt buộc để NotificationService biết gửi cho ai
  paymentStatus: PaymentNotificationStatus; // Trạng thái thanh toán (SUCCESS/FAILED)
  paymentMethod?: string;
  transactionId?: string;
  paymentResponseCode?: string;
  paymentResponseMessage?: string;
  processedAt?: string | Date;
  // Thêm các thông tin khác mà email/thông báo cần
  // totalAmount?: number; // Có thể lấy từ OrderService hoặc gửi kèm
}