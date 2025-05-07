// src/payment/dto/vnpay-ipn.dto.ts
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class VnpayIpnQueryDto {
  @IsNumberString() vnp_Amount: string;
  @IsString() @IsOptional() vnp_BankCode?: string; // NCB
  @IsString() @IsOptional() vnp_BankTranNo?: string; // VNP14943043
  @IsString() @IsOptional() vnp_CardType?: string; // ATM
  @IsString() vnp_OrderInfo: string;
  @IsString() vnp_PayDate: string; // 20250507101603
  @IsString() vnp_ResponseCode: string; // 00
  @IsString() vnp_TmnCode: string; // V85N8VWZ (Lưu ý: Log cũ của bạn là USF2T93R, log mới là V85N8VWZ. Cần nhất quán hoặc lấy từ config)
  @IsString() vnp_TransactionNo: string; // 14943043
  @IsString() vnp_TransactionStatus: string; // 00
  @IsString() vnp_TxnRef: string; // 5d01b99c...
  @IsString() vnp_SecureHash: string; // db1f9e...

  // Kiểm tra xem VNPAY có gửi vnp_SecureHashType không, nếu có thì thêm:
  // @IsString() @IsOptional() vnp_SecureHashType?: string;
}