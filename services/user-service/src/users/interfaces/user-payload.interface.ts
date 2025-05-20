// src/users/interfaces/user-payload.interface.ts
import { UserRole } from '../entities/user.entity'; // <<< Import UserRole enum

export interface UserPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole; // <<< THÊM TRƯỜNG ROLE
  createdAt: Date;
  updatedAt: Date;
  // Các trường khác không bao gồm password hay methods
}