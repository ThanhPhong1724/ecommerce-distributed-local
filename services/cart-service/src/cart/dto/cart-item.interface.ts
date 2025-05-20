// src/cart/interfaces/cart-item.interface.ts
export interface CartItem {
  productId: string;
  quantity: number;
  name: string; // Cho phép undefined
  price: number;
  img: string | null;
}
