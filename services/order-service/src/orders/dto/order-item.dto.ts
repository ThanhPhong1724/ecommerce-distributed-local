// src/orders/dto/order-item.dto.ts
import { Exclude, Expose } from 'class-transformer'; // Dùng để kiểm soát việc expose dữ liệu

// @Exclude() // Bỏ comment nếu muốn mặc định ẩn hết và chỉ expose các field được đánh dấu @Expose
export class OrderItemDto {
  @Expose() // Đánh dấu để hiển thị field này
  id: string;

  @Expose()
  productId: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number; // Giá tại thời điểm mua

  @Expose()
  productName: string; // Tên sản phẩm tại thời điểm mua

  // Không expose orderId và order object để tránh vòng lặp và dư thừa dữ liệu
  // @Exclude() // Không cần nếu đã dùng @Exclude() ở trên class
  // orderId: string;

  // constructor (partial: Partial<OrderItemDto>) { // Constructor để dễ map từ entity
  //   Object.assign(this, partial);
  // }
}