// src/orders/entities/order-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string; // Lưu ID của sản phẩm

  @Column()
  quantity: number; // Số lượng đặt

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Giá tại thời điểm đặt hàng
  price: number;

  @Column() // Tên sản phẩm tại thời điểm đặt hàng (tránh thay đổi sau này)
  productName: string;

  // Nhiều OrderItem thuộc về một Order
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' }) // Xóa items nếu order bị xóa
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;
}