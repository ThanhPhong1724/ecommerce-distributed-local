// Gợi ý vị trí: src/interfaces/events/payment-processed-payload.interface.ts

export enum PaymentStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    PENDING = 'pending', // Có thể có trạng thái chờ xử lý
    CANCELLED = 'cancelled',
  }
  
  export interface PaymentProcessedPayload {
    /** Định danh duy nhất của đơn hàng liên quan */
    orderId: string;
  
    /** Trạng thái xử lý thanh toán */
    paymentStatus: PaymentStatus;
  
    /** (Tùy chọn) Mã giao dịch từ cổng thanh toán (VNPay) */
    transactionId?: string;
  
    /** (Tùy chọn) Mã phản hồi từ cổng thanh toán */
    paymentResponseCode?: string; // Ví dụ: '00' của VNPay
  
    /** (Tùy chọn) Thông điệp phản hồi từ cổng thanh toán */
    paymentResponseMessage?: string;
  
    /** (Tùy chọn) Phương thức thanh toán được sử dụng */
    paymentMethod?: string; // Ví dụ: 'VNPAYQR', 'VNBANK', 'INTCARD'
  
    /** (Tùy chọn) Thời gian giao dịch được xử lý bởi cổng thanh toán */
    processedAt?: string | Date;
  
    /** (Tùy chọn) Thêm userId để notification service biết gửi mail cho ai */
    userId?: string;
  }