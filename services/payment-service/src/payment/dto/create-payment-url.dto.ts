// src/payment/dto/create-payment-url.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePaymentUrlDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsNumber({ maxDecimalPlaces: 0 }) // VNPay yêu cầu số nguyên
  @IsPositive()
  amount: number; // Số tiền cần thanh toán (đơn vị VNĐ)

  @IsString()
  @MaxLength(100)
  orderDescription: string; // Mô tả đơn hàng

  @IsString()
  @IsOptional() // Ngân hàng có thể chọn ở VNPay hoặc gửi từ client
  bankCode?: string; // Ví dụ: NCB, VISA, MASTER, VNPAYQR...

  @IsString()
  @IsOptional()
  language: string = 'vn'; // Ngôn ngữ giao diện VNPay (vn/en)
}