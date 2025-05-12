// src/interfaces/cart-item.interface.ts
export interface CartItem {
  productId: string;
  quantity: number;
  // Thêm các thông tin khác từ Product nếu cần hiển thị trong giỏ (name, price, imageUrl)
  // Những thông tin này thường được lấy khi hiển thị, không nhất thiết lưu hết trong Cart state
  name?: string;
  price?: number;
  img?: string;
}