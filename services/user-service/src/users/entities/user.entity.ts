// src/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert, // Import hook để hash password
  } from 'typeorm';
  import * as bcrypt from 'bcrypt'; // Import bcrypt
  
  @Entity('users') // Đặt tên bảng là 'users'
  export class User {
    @PrimaryGeneratedColumn('uuid') // Khóa chính dạng UUID
    id: string;
  
    @Column({ unique: true, nullable: false }) // Email là duy nhất, không được null
    email: string;
  
    @Column({ nullable: false }) // Password không được null
    password: string;
  
    @Column({ nullable: true }) // Tên có thể null ban đầu
    firstName: string;
  
    @Column({ nullable: true })
    lastName: string;
  
    @CreateDateColumn() // Tự động lưu ngày tạo
    createdAt: Date;
  
    @UpdateDateColumn() // Tự động lưu ngày cập nhật
    updatedAt: Date;
  
    // Hook: Tự động hash password trước khi lưu vào DB
    @BeforeInsert()
    async hashPassword() {
      // Chỉ hash nếu password được cung cấp (tránh hash lại khi update mà ko đổi pass)
      if (this.password) {
          const saltRounds = 10; // Độ phức tạp của salt
          this.password = await bcrypt.hash(this.password, saltRounds);
      }
    }
  
    // Phương thức để kiểm tra password (không lưu vào DB)
    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
  }