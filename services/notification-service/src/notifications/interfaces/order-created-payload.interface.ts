// Gợi ý vị trí: src/interfaces/events/order-created-payload.interface.ts

// Import kiểu OrderStatus nếu muốn dùng trong interface
// import { OrderStatus } from '../../orders/entities/order.entity'; // Điều chỉnh đường dẫn nếu cần

// Định nghĩa kiểu cho một item trong đơn hàng
interface OrderItemPayload {
    productId: string;
    productName: string;
    quantity: number;
    price: number; // Giá của 1 sản phẩm tại thời điểm đặt hàng
  }
  
  export interface OrderCreatedPayload {
    /** Định danh duy nhất của đơn hàng */
    orderId: string;
  
    /** Định danh của người dùng đặt hàng */
    userId: string;
  
    /** Tổng số tiền của đơn hàng (đã tính toán) */
    totalAmount: number;
  
    /** Danh sách các sản phẩm trong đơn hàng */
    items: OrderItemPayload[];
  
    /** Địa chỉ giao hàng */
    shippingAddress: string | null; // Cho phép null nếu entity cho phép
  
    /** Thời gian đơn hàng được tạo */
    createdAt: string | Date; // Giữ nguyên vì Date có thể serialize thành string
  
    /** (Tùy chọn) Trạng thái ban đầu của đơn hàng */
    // status: OrderStatus; // Thường là PENDING, có thể không cần gửi đi
  
    /** (Tùy chọn) Thêm email người dùng nếu lấy được ngay lúc tạo đơn */
    // userEmail?: string;
  }