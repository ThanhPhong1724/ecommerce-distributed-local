import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './../products.controller';
import { ProductsService } from './../products.service';
import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module'; // Import để dùng CategoriesService

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Đăng ký Product Entity
    CategoriesModule // Import để inject CategoriesService vào ProductsService (nếu cần)
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService] // Export nếu service khác cần dùng
})
export class ProductsModule {}