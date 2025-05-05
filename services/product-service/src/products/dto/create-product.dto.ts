// src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, IsOptional, Min, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() price: number;
  @IsInt() @Min(0) stockQuantity: number;
  @IsUUID() @IsNotEmpty() categoryId: string;
  @IsString() @IsOptional() img?: string; // Thêm trường img, không bắt buộc
}