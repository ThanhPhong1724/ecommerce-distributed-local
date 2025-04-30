// src/orders/dto/order.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { OrderItemDto } from './order-item.dto'; // Import OrderItemDto

// @Exclude()
export class OrderDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  totalAmount: number;

  @Expose()
  shippingAddress?: string; // Dùng optional chaining hoặc kiểm tra null

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderItemDto) // <<< Quan trọng: Chỉ định kiểu của các phần tử trong mảng items
  items: OrderItemDto[]; // Mảng chứa các OrderItemDto

  // constructor (partial: Partial<OrderDto>) {
  //   Object.assign(this, partial);
  // }
}