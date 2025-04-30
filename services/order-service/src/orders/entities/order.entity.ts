// src/orders/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',       // Chờ xử lý/thanh toán
  PROCESSING = 'processing', // Đang xử lý (sau khi thanh toán thành công)
  COMPLETED = 'completed',   // Hoàn thành
  CANCELLED = 'cancelled',   // Bị hủy
  FAILED = 'failed',         // Thanh toán thất bại
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() // Đánh index để tìm kiếm theo userId nhanh hơn
  @Column()
  userId: string; // Lưu ID của user đặt hàng

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING, // Trạng thái mặc định khi mới tạo
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) // Tổng tiền đơn hàng
  totalAmount: number;

  // Một Order có nhiều OrderItem
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true, // Tự động lưu/cập nhật/xóa OrderItems khi Order thay đổi
  })
  items: OrderItem[];

  // Có thể thêm các trường khác: địa chỉ giao hàng, ghi chú...
  @Column({ nullable: true })
  shippingAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}