// src/cart/interfaces/cart-item.interface.ts
export interface CartItem {
    productId: string;
    quantity: number;
    // Có thể thêm các thông tin khác lấy từ product-service sau này nếu cần
    // name?: string;
    // price?: number;
  }