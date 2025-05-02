// src/payment/payment.service.ts
import { Injectable, Inject, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common'; // Thêm các Exception
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { VnpayReturnQueryDto } from './dto/vnpay-query.dto';
import { VnpayIpnQueryDto } from './dto/vnpay-ipn.dto'; // Import đúng DTO
import { OrderStatus } from '../interfaces/order-status.enum'; // Đã có

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private vnp_TmnCode: string;
  private vnp_HashSecret: string;
  private vnp_Url: string;
  private vnp_ReturnUrl: string;
  private vnp_IpnUrl: string;
  private frontend_url: string; // Thêm biến frontend_url

  constructor(
    // Inject ConfigService trực tiếp vào đây thay vì chỉ trong AppModule
    private readonly configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {
    this.vnp_TmnCode = this.configService.get<string>('VNPAY_TMN_CODE')!;
    this.vnp_HashSecret = this.configService.get<string>('VNPAY_SECRET_KEY')!;
    this.vnp_Url = this.configService.get<string>('VNPAY_END_POINT')!;
    this.vnp_ReturnUrl = this.configService.get<string>('VNPAY_RETURN_URL')!;
    this.vnp_IpnUrl = this.configService.get<string>('VNPAY_IPN_URL')!;
    this.frontend_url = this.configService.get<string>('FRONTEND_URL')!; // Lấy FRONTEND_URL

    if (!this.vnp_TmnCode || !this.vnp_HashSecret || !this.vnp_Url || !this.vnp_ReturnUrl || !this.vnp_IpnUrl || !this.frontend_url) {
      this.logger.error('Thiếu cấu hình VNPay hoặc Frontend URL trong biến môi trường!');
      throw new InternalServerErrorException('Lỗi cấu hình hệ thống thanh toán.');
    }
     this.logger.log('VNPay Config Loaded:', { tmnCode: this.vnp_TmnCode, returnUrl: this.vnp_ReturnUrl, ipnUrl: this.vnp_IpnUrl });
     this.logger.log('Frontend URL Loaded:', this.frontend_url);
  }

  // Tạo URL thanh toán VNPay (Code của bạn đã ổn)
  createPaymentUrl(
    ipAddr: string,
    orderId: string,
    amount: number,
    orderDescription: string,
    bankCode: string = '',
    language: string = 'vn',
  ): string {
    const createDate = new Date();
    const formattedCreateDate = format(createDate, 'yyyyMMddHHmmss');

    // VNPay Amount requires integer (multiply by 100)
    const amountFormatted = amount * 100;

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = language;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId; // Mã tham chiếu đơn hàng
    vnp_Params['vnp_OrderInfo'] = orderDescription;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amountFormatted;
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl; // Sử dụng biến đã lấy từ config
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = formattedCreateDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = this.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
    this.logger.log(`Tạo VNPay URL cho Order ${orderId}: ${paymentUrl}`);
    return paymentUrl;
  }

  // Xử lý Return URL (Code của bạn đã ổn)
  handleVnpayReturn(query: VnpayReturnQueryDto): { code: string; message: string; orderId: string, status: OrderStatus, frontendReturnUrl: string } {
    const secureHash = query.vnp_SecureHash;
    const orderId = query.vnp_TxnRef; // Lấy orderId từ query
    delete query.vnp_SecureHash;

    const params = this.sortObject(query);
    const signData = new URLSearchParams(params).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    let responseCode: string;
    let message: string;
    let status: OrderStatus = OrderStatus.FAILED;

    if (secureHash === signed) {
      this.logger.log(`VNPay Return Hash hợp lệ cho Order: ${orderId}`);
      if (query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00') {
        responseCode = '00';
        message = 'Giao dịch thành công';
        status = OrderStatus.PROCESSING;
        this.logger.log(`VNPay Return báo thành công cho Order: ${orderId}`);
      } else {
        responseCode = query.vnp_ResponseCode;
        message = this.getVnpayMessage(responseCode);
        status = OrderStatus.FAILED;
        this.logger.warn(`VNPay Return báo thất bại cho Order: ${orderId}, Code: ${responseCode}`);
      }
    } else {
      this.logger.error(`VNPay Return Hash KHÔNG hợp lệ cho Order: ${orderId}`);
      responseCode = '97';
      message = 'Chữ ký không hợp lệ';
      status = OrderStatus.FAILED;
    }
    // Tạo URL trả về cho Frontend
    const frontendReturnUrl = `${this.frontend_url}/payment/result?orderId=${orderId}&code=${responseCode}&message=${encodeURIComponent(message)}`;
    return { code: responseCode, message, orderId, status, frontendReturnUrl };
  }

   // Xử lý IPN từ VNPay (Quan trọng nhất)
   async handleVnpayIPN(query: VnpayIpnQueryDto): Promise<{ RspCode: string; Message: string }> {
    const secureHash = query.vnp_SecureHash;
    const orderId = query.vnp_TxnRef;
    const rspCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;
    const amount = parseInt(query.vnp_Amount) / 100; // Chia lại cho 100

    delete query.vnp_SecureHash;
    const params = this.sortObject(query);
    const signData = new URLSearchParams(params).toString();
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // --- Bắt đầu kiểm tra ---
    try {
        // 1. Kiểm tra checksum
        if (secureHash !== signed) {
            this.logger.error(`IPN Checksum failed for Order ID: ${orderId}`);
            return { RspCode: "97", Message: "Invalid Checksum" };
        }
        this.logger.log(`IPN Checksum valid for Order ID: ${orderId}.`);

        // === PHẦN TƯƠNG TÁC VỚI ORDER SERVICE (SẼ IMPLEMENT KHI CÓ ORDER SERVICE) ===
        // 2. Kiểm tra Order ID có tồn tại và lấy thông tin đơn hàng
        this.logger.log(`Checking Order existence and details for Order ID: ${orderId}...`);
        // Placeholder: Giả sử gọi Order Service thành công và lấy được thông tin
        // const orderDetails = await this.callOrderServiceToCheck(orderId); // Hàm giả định
        const orderDetails = { exists: true, currentStatus: OrderStatus.PENDING, totalAmount: amount }; // Dữ liệu giả định

        if (!orderDetails.exists) {
            this.logger.error(`IPN Order ID not found via Order Service: ${orderId}`);
            return { RspCode: '01', Message: 'Order not found' };
        }
        this.logger.log(`IPN Order ID ${orderId} found.`);

        // 3. Kiểm tra số tiền
        if (orderDetails.totalAmount !== amount) {
            this.logger.error(`IPN Invalid amount for Order ID: ${orderId}. Expected: ${orderDetails.totalAmount}, Received: ${amount}`);
            return { RspCode: '04', Message: 'Invalid amount' };
        }
        this.logger.log(`IPN Amount valid for Order ID: ${orderId}.`);

        // 4. Kiểm tra trạng thái đơn hàng (tránh xử lý lại)
        if (orderDetails.currentStatus !== OrderStatus.PENDING) {
            this.logger.warn(`IPN Order ID ${orderId} is not in PENDING state (Current: ${orderDetails.currentStatus}). Already processed?`);
            // VNPay yêu cầu trả về 00 và message thành công nếu đã xử lý trước đó
            return { RspCode: '00', Message: 'Confirm Success' };
             // Hoặc trả mã 02 nếu muốn báo lỗi rõ hơn (nhưng VNPay có thể gửi lại IPN)
             // return { RspCode: '02', Message: 'Order already confirmed' };
        }
        this.logger.log(`IPN Order ID ${orderId} status is PENDING. Processing payment result...`);
        // === KẾT THÚC PHẦN TƯƠNG TÁC VỚI ORDER SERVICE ===


        // --- Xử lý kết quả giao dịch ---
        let paymentStatus: OrderStatus;
        if (rspCode === "00" && transactionStatus === "00") {
            paymentStatus = OrderStatus.PROCESSING; // Thành công -> Order chuyển sang Đang xử lý
            this.logger.log(`IPN Payment SUCCESS for Order ID: ${orderId}`);
        } else {
            paymentStatus = OrderStatus.FAILED; // Thất bại -> Order chuyển sang Thất bại
            this.logger.warn(`IPN Payment FAILED for Order ID: ${orderId}, RspCode: ${rspCode}, TxnStatus: ${transactionStatus}`);
        }

        // --- Publish sự kiện `payment_processed` ---
        const eventPayload = {
            orderId: orderId,
            status: paymentStatus, // Trạng thái mới của Order
            paymentMethod: 'VNPay', // Thêm thông tin phương thức TT
            transactionId: query.vnp_TransactionNo, // Mã giao dịch VNPay
            paymentTime: query.vnp_PayDate ? format(new Date(this.parseVnpayDate(query.vnp_PayDate)), 'yyyy-MM-dd HH:mm:ss') : new Date().toISOString(), // Thời gian thanh toán
            errorCode: rspCode,
            errorMessage: this.getVnpayMessage(rspCode),
        };
        try {
            this.logger.log(`Publishing payment_processed event: ${JSON.stringify(eventPayload)}`);
            // Dùng emit để gửi đi, không cần chờ phản hồi
            this.rabbitClient.emit('payment_processed', eventPayload);
            // Không cần `await firstValueFrom(this.rabbitClient.emit(...))` nếu chỉ là thông báo
        } catch (error) {
            this.logger.error(`Error publishing payment_processed event for Order ${orderId}: ${error.message}`, error.stack);
            // Vẫn nên trả về thành công cho VNPay để tránh bị gọi IPN lại
        }

        // --- Trả kết quả thành công cho VNPay ---
        this.logger.log(`Responding 'Confirm Success' to VNPay for Order ID: ${orderId}`);
        return { RspCode: "00", Message: "Confirm Success" };

    } catch (error) {
        this.logger.error(`Unexpected error handling IPN for Order ID: ${orderId}: ${error.message}`, error.stack);
        // Trả lỗi chung cho VNPay nếu có lỗi ngoài dự kiến
        return { RspCode: '99', Message: 'Unknown error' };
    }
}


  // Hàm helper sortObject (Code của bạn đã ổn)
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
       // Cần decode key trước khi gán vào sorted object
       const decodedKey = decodeURIComponent(str[key]);
      sorted[decodedKey] = encodeURIComponent(obj[decodedKey]).replace(/%20/g, '+');
    }
    return sorted;
  }

  // Hàm helper getVnpayMessage (Code của bạn đã ổn)
  private getVnpayMessage(responseCode: string): string {
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
        default: return `Giao dịch thất bại (Mã: ${responseCode})`; // Trả về cả mã lỗi
    }
  }

  // Hàm helper để parse chuỗi ngày giờ yyyyMMddHHmmss của VNPay thành Date
  private parseVnpayDate(vnpDate: string): Date {
    const year = parseInt(vnpDate.substring(0, 4));
    const month = parseInt(vnpDate.substring(4, 6)) - 1; // Tháng trong JS là 0-11
    const day = parseInt(vnpDate.substring(6, 8));
    const hour = parseInt(vnpDate.substring(8, 10));
    const minute = parseInt(vnpDate.substring(10, 12));
    const second = parseInt(vnpDate.substring(12, 14));
    return new Date(year, month, day, hour, minute, second);
  }
}