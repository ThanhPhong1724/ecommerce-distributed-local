// src/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Hoặc '@nestjs/swagger' nếu dùng Swagger
import { CreateCategoryDto } from './create-category.dto';
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}