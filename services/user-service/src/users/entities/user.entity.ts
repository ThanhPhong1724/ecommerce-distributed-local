// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// --- ĐỊNH NGHĨA ENUM CHO ROLE ---
export enum UserRole {
  USER = 'user', // Vai trò người dùng thông thường
  ADMIN = 'admin', // Vai trò quản trị viên
}
// --------------------------------

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string; 

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  // --- THÊM CỘT ROLE ---
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // Mặc định là user thường khi đăng ký
  })
  role: UserRole; // Hoặc roles: UserRole[] nếu muốn nhiều vai trò
  // -----------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}