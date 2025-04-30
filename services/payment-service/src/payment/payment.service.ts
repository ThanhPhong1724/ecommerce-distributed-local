// src/payment/payment.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto'; // Import crypto của Node.js
import { format } from 'date-fns'; // Import date-fns
import { VnpayReturnQueryDto } from './dto/vnpay-query.dto';
import { OrderStatus } from './../interfaces/order-status.enum'; // Tạo interface này

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private vnp_TmnCode: string;
  private vnp_HashSecret: string;
  private vnp_Url: string;
  private vnp_ReturnUrl: string; // URL VNPay trả về trình duyệt sau khi thanh toán
  private vnp_IpnUrl: string; // URL VNPay gọi ngầm để xác nhận kết quả

  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {
    this.vnp_TmnCode = this.configService.get<string>('VNPAY_TMN_CODE')!;
    this.vnp_HashSecret = this.configService.get<string>('VNPAY_SECRET_KEY')!;
    this.vnp_Url = this.configService.get<string>('VNPAY_END_POINT')!;
    // Lấy URL trả về và IPN từ biến môi trường (sẽ cấu hình sau)
    this.vnp_ReturnUrl = this.configService.get<string>('VNPAY_RETURN_URL')!;
    this.vnp_IpnUrl = this.configService.get<string>('VNPAY_IPN_URL')!;

    if (!this.vnp_TmnCode || !this.vnp_HashSecret || !this.vnp_Url || !this.vnp_ReturnUrl || !this.vnp_IpnUrl) {
        throw new Error('Thiếu cấu hình VNPay trong biến môi trường!');
    }
  }

  // Tạo URL thanh toán VNPay
  createPaymentUrl(
    ipAddr: string, // Địa chỉ IP của khách hàng (quan trọng)
    orderId: string,
    amount: number,
    orderDescription: string,
    bankCode: string = '', // Để trống nếu muốn hiển thị cổng chọn ngân hàng
    language: string = 'vn',
  ): string {
    const createDate = new Date();
    const formattedCreateDate = format(createDate, 'yyyyMMddHHmmss'); // Format yyyyMMddHHmmss

    const orderIdFormatted = orderId; // Giữ nguyên hoặc format nếu cần
    const amountFormatted = amount * 100; // VNPay yêu cầu nhân 100

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = language;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderIdFormatted; // Mã tham chiếu đơn hàng
    vnp_Params['vnp_OrderInfo'] = orderDescription;
    vnp_Params['vnp_OrderType'] = 'other'; // Hoặc loại hàng hóa phù hợp
    vnp_Params['vnp_Amount'] = amountFormatted;
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl; // URL trả về trình duyệt
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = formattedCreateDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp params theo alphabet
    vnp_Params = this.sortObject(vnp_Params);

    // Tạo chuỗi dữ liệu hash
    const signData = new URLSearchParams(vnp_Params).toString();

    // Tạo chữ ký SHA512
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    // Build URL thanh toán
    const paymentUrl = this.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
    this.logger.log(`Tạo VNPay URL cho Order ${orderId}: ${paymentUrl}`);
    return paymentUrl;
  }

  // Hàm xử lý kết quả trả về từ VNPay (Return URL)
  handleVnpayReturn(query: VnpayReturnQueryDto): { code: string; message: string; orderId: string, status: OrderStatus } {
    const secureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash; // Xóa hash khỏi object để kiểm tra

    const params = this.sortObject(query);
    const signData = new URLSearchParams(params).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    let responseCode: string;
    let message: string;
    let status: OrderStatus = OrderStatus.FAILED; // Mặc định là failed

    if (secureHash === signed) {
      this.logger.log(`VNPay Return Hash hợp lệ cho Order: ${query.vnp_TxnRef}`);
      // Kiểm tra kết quả giao dịch
      if (query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00') {
        responseCode = '00';
        message = 'Giao dịch thành công';
        status = OrderStatus.PROCESSING; // Coi như thành công ở return (nhưng nên đợi IPN)
        this.logger.log(`VNPay Return báo thành công cho Order: ${query.vnp_TxnRef}`);
      } else {
        responseCode = query.vnp_ResponseCode;
        message = this.getVnpayMessage(responseCode); // Hàm helper lấy thông báo lỗi
        status = OrderStatus.FAILED;
        this.logger.warn(`VNPay Return báo thất bại cho Order: ${query.vnp_TxnRef}, Code: ${responseCode}`);
      }
    } else {
      this.logger.error(`VNPay Return Hash KHÔNG hợp lệ cho Order: ${query.vnp_TxnRef}`);
      responseCode = '97'; // Mã lỗi checksum không hợp lệ
      message = 'Chữ ký không hợp lệ';
      status = OrderStatus.FAILED;
    }
    return { code: responseCode, message, orderId: query.vnp_TxnRef, status };
  }

   // Hàm xử lý IPN từ VNPay (Quan trọng nhất)
   async handleVnpayIPN(query: VnpayReturnQueryDto): Promise<{ RspCode: string; Message: string }> {
    const secureHash = query.vnp_SecureHash;
    const orderId = query.vnp_TxnRef;
    const rspCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;

    delete query.vnp_SecureHash;
    const params = this.sortObject(query);
    const signData = new URLSearchParams(params).toString();
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // --- Các bước kiểm tra theo tài liệu VNPay ---
    // 1. Kiểm tra checksum
    if (secureHash !== signed) {
        this.logger.error(`IPN Checksum failed for Order ID: ${orderId}`);
        return { RspCode: "97", Message: "Invalid Checksum" };
    }

    // 2. Kiểm tra Order ID có tồn tại trong hệ thống không
    // TODO: Cần gọi Order Service để kiểm tra `orderId` có tồn tại không
    //       và kiểm tra trạng thái hiện tại của đơn hàng.
    //       Ví dụ: const orderExists = await this.checkOrderExists(orderId);
    //       if (!orderExists) { return { RspCode: '01', Message: 'Order not found' }; }
    this.logger.log(`IPN Checksum valid for Order ID: ${orderId}. Checking order existence...`);
    // Giả sử luôn tồn tại để test
    const orderExists = true;
     if (!orderExists) {
         this.logger.error(`IPN Order ID not found: ${orderId}`);
         return { RspCode: '01', Message: 'Order not found' };
     }

    // 3. Kiểm tra số tiền
    // TODO: Gọi Order Service lấy thông tin đơn hàng và so sánh `query.vnp_Amount / 100` với `order.totalAmount`
    //       Ví dụ: const order = await this.getOrderDetails(orderId);
    //       if (order.totalAmount !== parseInt(query.vnp_Amount) / 100) { return { RspCode: '04', Message: 'Invalid amount' }; }
    this.logger.log(`IPN Order ID ${orderId} found. Checking amount...`);
     // Giả sử số tiền đúng
     const isAmountValid = true;
     if (!isAmountValid) {
         this.logger.error(`IPN Invalid amount for Order ID: ${orderId}`);
         return { RspCode: '04', Message: 'Invalid amount' };
     }

    // 4. Kiểm tra trạng thái đơn hàng (tránh xử lý lại IPN đã xử lý)
    // TODO: Gọi Order Service lấy trạng thái đơn hàng. Nếu đã là PROCESSING hoặc COMPLETED thì trả về 02.
    //       Ví dụ: if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.COMPLETED) { return { RspCode: '02', Message: 'Order already confirmed' }; }
    this.logger.log(`IPN Amount valid for Order ID: ${orderId}. Checking order status...`);
    // Giả sử trạng thái là PENDING
    const isOrderPending = true;
    if (!isOrderPending) {
        this.logger.warn(`IPN Order ID ${orderId} already confirmed.`);
        return { RspCode: '02', Message: 'Order already confirmed' };
    }

    // --- Xử lý kết quả giao dịch ---
    let paymentStatus: OrderStatus;
    if (rspCode === "00" && transactionStatus === "00") {
        paymentStatus = OrderStatus.PROCESSING; // Thành công -> Đang xử lý
        this.logger.log(`IPN Payment SUCCESS for Order ID: ${orderId}`);
    } else {
        paymentStatus = OrderStatus.FAILED; // Thất bại
        this.logger.warn(`IPN Payment FAILED for Order ID: ${orderId}, RspCode: ${rspCode}, TxnStatus: ${transactionStatus}`);
    }

    // --- Publish sự kiện payment_processed ---
    try {
        this.logger.log(`Publishing payment_processed event for Order ID: ${orderId} with status: ${paymentStatus}`);
        this.rabbitClient.emit('payment_processed', {
            orderId: orderId,
            status: paymentStatus,
            vnp_TransactionNo: query.vnp_TransactionNo, // Gửi kèm mã giao dịch VNPay nếu cần
            vnp_ResponseCode: rspCode
        });
    } catch (error) {
        this.logger.error(`Error publishing payment_processed event for Order ${orderId}: ${error.message}`);
        // Không nên trả lỗi cho VNPay nếu chỉ lỗi publish event
    }

    // --- Trả kết quả thành công cho VNPay ---
    // Quan trọng: Phải trả về mã 00 để VNPay biết IPN đã được xử lý.
    return { RspCode: "00", Message: "Confirm Success" };
}


  // Hàm helper sắp xếp object theo key alphabet
  private sortObject(obj: any): any {
    let sorted: any = {};
    let str: string[] = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  // Hàm helper lấy thông báo lỗi VNPay (tham khảo tài liệu VNPay)
  private getVnpayMessage(responseCode: string): string {
    // Thêm các mã lỗi khác từ tài liệu VNPay nếu cần
    switch (responseCode) {
        case '00': return 'Giao dịch thành công';
        case '07': return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên hệ VNPAY).';
        case '09': return 'Thẻ/Tài khoản chưa đăng ký Internet Banking tại ngân hàng.';
        case '10': return 'Thẻ/Tài khoản hết hạn/khóa.';
        case '11': return 'Giao dịch không thành công do không xác thực được khách hàng.';
        case '12': return 'Thẻ/Tài khoản không đủ số dư.';
        case '13': return 'Nhập sai mật khẩu xác thực giao dịch (OTP).';
        case '24': return 'Khách hàng hủy giao dịch.';
        case '51': return 'Tài khoản không đủ số dư.';
        case '65': return 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.';
        case '75': return 'Ngân hàng bảo trì.';
        case '79': return 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.';
        case '99': return 'Lỗi không xác định.';
        default: return 'Giao dịch thất bại';
    }
  }
}

// Tạo thêm interface OrderStatus nếu chưa có
// src/interfaces/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}