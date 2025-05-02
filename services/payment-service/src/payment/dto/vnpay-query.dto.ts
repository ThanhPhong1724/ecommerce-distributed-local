// src/payment/dto/vnpay-query.dto.ts
// Các trường VNPay gửi về qua query params
export class VnpayReturnQueryDto {
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo?: string; // Có thể không có nếu chưa thanh toán
    vnp_CardType?: string;
    vnp_OrderInfo: string;
    vnp_PayDate?: string;
    vnp_ResponseCode: string; // Mã trạng thái giao dịch (00 = thành công)
    vnp_TmnCode: string;
    vnp_TransactionNo: string; // Mã giao dịch VNPay
    vnp_TransactionStatus: string; // Trạng thái giao dịch (00 = thành công)
    vnp_TxnRef: string; // Mã đơn hàng của bạn (orderId)
    vnp_SecureHash?: string; // Chữ ký kiểm tra
}