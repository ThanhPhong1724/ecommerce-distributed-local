import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './../categories.controller';
import { CategoriesService } from './../categories.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // Đăng ký Category Entity
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService] // Export nếu service khác cần dùng
})
export class CategoriesModule {}