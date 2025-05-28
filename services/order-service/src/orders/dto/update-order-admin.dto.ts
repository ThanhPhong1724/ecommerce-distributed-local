// src/orders/dto/update-order-admin.dto.ts
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderAdminDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingAddress?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ.' })
  status?: OrderStatus;

  // Thêm các trường khác admin có thể sửa, ví dụ:
  // @IsOptional()
  // @IsString()
  // adminNotes?: string;
}