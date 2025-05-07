// src/payment/dto/vnpay-query.dto.ts
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class VnpayReturnQueryDto {
  @IsNumberString() // VNPay gửi amount dưới dạng string, và nó luôn có
  vnp_Amount: string;

  @IsString() // Thường có nếu giao dịch qua ngân hàng cụ thể
  @IsOptional() // Có thể không có nếu thanh toán qua cổng VNPAY chung mà chưa chọn bank
  vnp_BankCode?: string; // << Sửa lại: VNPay thường gửi BankCode kể cả khi thành công/thất bại

  @IsString()
  @IsOptional()
  vnp_BankTranNo?: string;

  @IsString()
  @IsOptional()
  vnp_CardType?: string;

  @IsString() // Luôn có
  vnp_OrderInfo: string;

  @IsString() // Định dạng yyyyMMddHHmmss
  @IsOptional() // Có thể không có nếu giao dịch thất bại ngay từ đầu
  vnp_PayDate?: string;

  @IsString() // Luôn có
  vnp_ResponseCode: string;

  @IsString() // Luôn có
  vnp_TmnCode: string;

  @IsString() // Luôn có, kể cả khi thất bại (có thể là '0')
  vnp_TransactionNo: string;

  @IsString() // Luôn có
  vnp_TransactionStatus: string;

  @IsString() // Luôn có
  vnp_TxnRef: string; // Mã đơn hàng của bạn (orderId)

  // Bạn có thể thêm vnp_SecureHashType nếu VNPAY gửi và bạn muốn dùng
  // @IsString()
  // @IsOptional()
  // vnp_SecureHashType?: string;

  @IsString() // SecureHash luôn được gửi và là bắt buộc
  vnp_SecureHash: string;
}

