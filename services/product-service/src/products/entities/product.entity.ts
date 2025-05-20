// src/products/entities/product.entity.ts
import { Category } from '../../categories/entities/category.entity'; // Import Category
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true }) // Kiểu text cho mô tả dài hơn
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false }) // Kiểu số thập phân cho giá
  price: number;

  @Column({ type: 'int', default: 0 }) // Số lượng tồn kho, mặc định là 0
  stockQuantity: number;

  @Column({ nullable: true }) // Thêm trường img, có thể null
  img: string;

  // Nhiều Product thuộc về một Category
  @ManyToOne(() => Category, (category) => category.products, {
     nullable: false, // Sản phẩm phải thuộc về một category
     onDelete: 'RESTRICT' // Ngăn xóa category nếu còn sản phẩm thuộc về nó (hoặc chọn CASCADE, SET NULL tùy logic)
  })
  @JoinColumn({ name: 'categoryId' }) // Tên cột khóa ngoại trong bảng products
  category: Category;

  @Column() // Cột này sẽ tự động được tạo bởi @JoinColumn
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}