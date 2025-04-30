// src/cart/interfaces/cart.interface.ts
import { CartItem } from './cart-item.interface';

export interface Cart {
  userId: string;
  items: CartItem[];
  // Có thể thêm tổng tiền, ngày cập nhật...
  // totalPrice?: number;
  // updatedAt?: Date;
}