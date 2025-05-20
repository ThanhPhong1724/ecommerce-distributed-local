// src/interfaces/cart.interface.ts
import { CartItem } from './cart-item.interface';

export interface Cart {
  // userId: string; // Có thể có hoặc không tùy API cart-service trả về
  items: CartItem[];
  // Thêm các trường khác nếu API cart-service trả về
}