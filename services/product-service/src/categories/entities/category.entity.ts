// src/categories/entities/category.entity.ts
import { Product } from '../../products/entities/product.entity'; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;
  
  @Column({ type: 'varchar', nullable: true }) // Chỉ định rõ kiểu dữ liệu là varchar
  img: string;

  // Một Category có thể có nhiều Product
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}