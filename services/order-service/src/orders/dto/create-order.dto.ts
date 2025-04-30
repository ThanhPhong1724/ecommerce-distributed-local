// src/orders/dto/create-order.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString({ message: 'Địa chỉ giao hàng phải là chuỗi' })
  @MaxLength(500, { message: 'Địa chỉ giao hàng không được quá 500 ký tự' }) // Thêm giới hạn độ dài ví dụ
  @IsOptional() // Cho phép không nhập địa chỉ lúc tạo đơn
  shippingAddress?: string;

  // Bạn có thể thêm các trường khác ở đây nếu cần user nhập liệu khi tạo đơn
  // Ví dụ: Ghi chú đơn hàng
  // @IsString()
  // @IsOptional()
  // notes?: string;
}