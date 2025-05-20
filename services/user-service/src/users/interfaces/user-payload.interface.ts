// src/users/interfaces/user-payload.interface.ts
export interface UserPayload {
    id: string;
    email: string;
    firstName: string | null; // Cho phép null nếu bạn khai báo nullable trong entity
    lastName: string | null;  // Cho phép null nếu bạn khai báo nullable trong entity
    createdAt: Date;
    updatedAt: Date;
    // Thêm các trường dữ liệu khác nếu có, trừ password và các phương thức
  }