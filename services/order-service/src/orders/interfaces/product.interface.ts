// src/interfaces/product.interface.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    // Chỉ cần định nghĩa các trường mà OrdersService cần đọc từ ProductService
  }