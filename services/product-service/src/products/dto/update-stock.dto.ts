import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateStockDto {
  @IsInt({ message: 'Số lượng thay đổi phải là số nguyên' })
  @IsNotEmpty({ message: 'Số lượng thay đổi không được để trống' })
  change: number; // Số lượng thay đổi (+ để tăng, - để giảm)
}