// Gợi ý vị trí: src/interfaces/product.interface.ts
// Interface này định nghĩa cấu trúc dữ liệu Product
// mà các service khác (như CartService, OrderService) mong đợi nhận được
// khi gọi API của ProductService. Nên giữ nó đơn giản và chỉ chứa
// các trường dữ liệu cần thiết cho giao tiếp giữa các service.

// (Tùy chọn) Import Category interface nếu bạn muốn định nghĩa kiểu rõ ràng hơn
// import { CategorySummary } from './category-summary.interface';

export interface Product {
    /** ID duy nhất của sản phẩm (UUID) */
    id: string;
  
    /** Tên sản phẩm */
    name: string;
  
    /** Mô tả sản phẩm (có thể là null) */
    description: string | null;
  
    /** Giá sản phẩm (dạng số) */
    price: number;
  
    /** Số lượng tồn kho hiện tại */
    stockQuantity: number;
  
    /** Đường dẫn ảnh sản phẩm (có thể là null) */
    imageUrl: string | null; // Đổi tên từ img thành imageUrl cho nhất quán? Hoặc giữ nguyên img
  
    /** Thông tin cơ bản của danh mục mà sản phẩm thuộc về */
    category?: { // Làm optional để tránh lỗi nếu product-service không trả về
      id: string;
      name: string;
    };
    // Hoặc dùng kiểu đã import: category?: CategorySummary;
  
    /** ID của danh mục (nếu cần truy cập trực tiếp) */
    categoryId: string;
  
    /** Thời gian tạo (thường là string khi truyền qua API) */
    createdAt?: string | Date; // Làm optional vì có thể không cần truyền giữa các service
  
    /** Thời gian cập nhật (thường là string khi truyền qua API) */
    updatedAt?: string | Date; // Làm optional
  }
  
  // (Tùy chọn) Interface tóm tắt cho Category để tránh phụ thuộc vòng
  // Gợi ý vị trí: src/interfaces/category-summary.interface.ts
  // export interface CategorySummary {
  //   id: string;
  //   name: string;
  // }