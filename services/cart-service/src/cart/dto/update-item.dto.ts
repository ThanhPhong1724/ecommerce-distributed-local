// src/cart/dto/update-item.dto.ts
import { IsInt, IsPositive } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}