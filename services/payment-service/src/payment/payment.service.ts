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
  // createPaymentUrl(
  //   ipAddr: string,
  //   orderId: string,
  //   amount: number,
  //   orderDescription: string,
  //   bankCode: string = '',
  //   language: string = 'vn',
  // ): string {
  //   const createDate = new Date();
  //   const formattedCreateDate = format(createDate, 'yyyyMMddHHmmss');

  //   // VNPay Amount requires integer (multiply by 100)
  //   const amountFormatted = amount * 100;

  //   let vnp_Params: any = {};
  //   vnp_Params['vnp_Version'] = '2.1.0';
  //   vnp_Params['vnp_Command'] = 'pay';
  //   vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
  //   vnp_Params['vnp_Locale'] = language;
  //   vnp_Params['vnp_CurrCode'] = 'VND';
  //   vnp_Params['vnp_TxnRef'] = orderId; // Mã tham chiếu đơn hàng
  //   vnp_Params['vnp_OrderInfo'] = orderDescription;
  //   vnp_Params['vnp_OrderType'] = 'other';
  //   vnp_Params['vnp_Amount'] = amountFormatted;
  //   vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl; // Sử dụng biến đã lấy từ config
  //   vnp_Params['vnp_IpAddr'] = ipAddr;
  //   vnp_Params['vnp_CreateDate'] = formattedCreateDate;
  //   if (bankCode !== null && bankCode !== '') {
  //     vnp_Params['vnp_BankCode'] = bankCode;
  //   }

  //   vnp_Params = this.sortObject(vnp_Params);
  //   const signData = new URLSearchParams(vnp_Params).toString();
  //   const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
  //   const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  //   vnp_Params['vnp_SecureHash'] = signed;

  //   const paymentUrl = this.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
  //   this.logger.log(`Tạo VNPay URL cho Order ${orderId}: ${paymentUrl}`);
  //   return paymentUrl;
  // }

   // Trong hàm createPaymentUrl:
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
    const amountFormatted = amount * 100;

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = language;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderDescription; // Sẽ được URLSearchParams encode
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amountFormatted;
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl; // Sẽ được URLSearchParams encode
    vnp_Params['vnp_IpAddr'] = ipAddr; // Sẽ được URLSearchParams encode
    vnp_Params['vnp_CreateDate'] = formattedCreateDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp các tham số
    const sortedParams = this.sortObject(vnp_Params);

    // Tạo chuỗi dữ liệu để ký
    // new URLSearchParams sẽ tự động encode các key và value theo chuẩn x-www-form-urlencoded
    const signData = new URLSearchParams(sortedParams).toString();

    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Thêm hash vào params (sau khi đã sort và tạo signData)
    // Quan trọng: Phải thêm vnp_SecureHash vào object *sau khi* đã tạo signData từ các params gốc
    // và trước khi tạo paymentUrl cuối cùng.
    // Cách tốt nhất là tạo một object mới cho payment URL params bao gồm cả hash.
    const paymentUrlParams = { ...sortedParams, vnp_SecureHash: signed };

    const paymentUrl = this.vnp_Url + '?' + new URLSearchParams(paymentUrlParams).toString();
    this.logger.log(`Tạo VNPay URL cho Order ${orderId}: ${paymentUrl}`);
    return paymentUrl;
  }

  // src/payment/payment.service.ts
  // ... (các imports và constructor giữ nguyên) ...

  handleVnpayReturn(query: VnpayReturnQueryDto): { code: string; message: string; orderId: string; status: OrderStatus; frontendReturnUrl: string } {
    this.logger.log(`[handleVnpayReturn] --- START --- Processing VNPAY RETURN for query: ${JSON.stringify(query)}`);

    const { vnp_SecureHash: receivedSecureHash, ...paramsWithoutHash } = query;
    const orderId = query.vnp_TxnRef; // Giả sử vnp_TxnRef là bắt buộc trong DTO và có giá trị

    this.logger.log(`[handleVnpayReturn] Received Order ID: ${orderId}`);
    this.logger.log(`[handleVnpayReturn] Received SecureHash: ${receivedSecureHash}`);
    this.logger.debug(`[handleVnpayReturn] Params for signing (without hash): ${JSON.stringify(paramsWithoutHash)}`);

    const sortedParamsToSign = this.sortObject(paramsWithoutHash);
    const signData = new URLSearchParams(sortedParamsToSign).toString();
    this.logger.log(`[handleVnpayReturn] String to sign (Order ID: ${orderId}): ${signData}`);

    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const calculatedSignedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    this.logger.log(`[handleVnpayReturn] Calculated Hash (Order ID: ${orderId}): ${calculatedSignedHash}`);

    let responseCodeResult: string; // Đổi tên biến để tránh nhầm lẫn với query.vnp_ResponseCode
    let messageResult: string;
    let statusResult: OrderStatus = OrderStatus.FAILED; // Khởi tạo mặc định là FAILED

    if (receivedSecureHash === calculatedSignedHash) {
      this.logger.log(`[handleVnpayReturn] VNPAY RETURN HASH VALID for Order ID: ${orderId}. Proceeding to check transaction status.`);

      const vnpResponseCode = query.vnp_ResponseCode; // Lấy từ query
      const vnpTransactionStatus = query.vnp_TransactionStatus; // Lấy từ query

      this.logger.log(`[handleVnpayReturn] VNPay Response Code from query: '${vnpResponseCode}'`);
      this.logger.log(`[handleVnpayReturn] VNPay Transaction Status from query: '${vnpTransactionStatus}'`);

      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
        this.logger.log(`[handleVnpayReturn] Transaction SUCCESSFUL (Code 00, Status 00) for Order ID: ${orderId}.`);
        responseCodeResult = '00';
        messageResult = 'Giao dịch thành công';
        statusResult = OrderStatus.PROCESSING; // Hoặc COMPLETED tùy theo logic của bạn
      } else {
        this.logger.warn(`[handleVnpayReturn] Transaction FAILED or PENDING (Code: ${vnpResponseCode}, Status: ${vnpTransactionStatus}) for Order ID: ${orderId}.`);
        responseCodeResult = vnpResponseCode || '99'; // Nếu vnp_ResponseCode undefined, dùng mã lỗi chung
        messageResult = this.getVnpayMessage(responseCodeResult);
        statusResult = OrderStatus.FAILED;
      }
    } else {
      this.logger.error(`[handleVnpayReturn] VNPAY RETURN HASH INVALID for Order ID: ${orderId}. Received: ${receivedSecureHash}, Calculated: ${calculatedSignedHash}`);
      responseCodeResult = '97'; // Mã lỗi VNPay: Sai chữ ký
      messageResult = 'Chữ ký không hợp lệ';
      statusResult = OrderStatus.FAILED;
    }

    this.logger.log(`[handleVnpayReturn] Final determined status for Order ID ${orderId}: Code='${responseCodeResult}', Status='${statusResult}', Message='${messageResult}'.`);

    const frontendReturnUrl = `${this.frontend_url}/payment/result?orderId=${orderId}&code=${responseCodeResult}&message=${encodeURIComponent(messageResult)}`;
    this.logger.log(`[handleVnpayReturn] Constructed Frontend Return URL: ${frontendReturnUrl}`);

    this.logger.log(`[handleVnpayReturn] --- END --- Processing VNPAY RETURN for Order ID: ${orderId}.`);
    return {
      code: responseCodeResult,
      message: messageResult,
      orderId: orderId!, // Thêm '!' nếu bạn chắc chắn orderId (vnp_TxnRef) luôn có từ DTO
      status: statusResult,
      frontendReturnUrl,
    };
  }


  
// src/payment/payment.service.ts

// ... (các imports khác, constructor, createPaymentUrl, handleVnpayReturn, sortObject, getVnpayMessage, parseVnpayDate) ...

async handleVnpayIPN(query: VnpayIpnQueryDto): Promise<{ RspCode: string; Message: string }> {
  this.logger.log(`[handleVnpayIPN] ******** SERVICE FUNCTION ENTERED (NEW CODE) ********`); // 
  // Sử dụng destructuring để tách vnp_SecureHash và các params còn lại
  const { vnp_SecureHash: receivedSecureHash, ...paramsWithoutHash } = query;

  // Lấy các thông tin cần thiết từ query gốc một cách an toàn
  const orderId = query.vnp_TxnRef; // Giả sử vnp_TxnRef là bắt buộc trong VnpayIpnQueryDto
  const rspCode = query.vnp_ResponseCode; // Giả sử vnp_ResponseCode là bắt buộc
  const transactionStatus = query.vnp_TransactionStatus; // Giả sử vnp_TransactionStatus là bắt buộc
  
  // Chuyển đổi amount từ string sang number. Đảm bảo vnp_Amount tồn tại và là string số.
  // Nếu vnp_Amount có thể không tồn tại, cần kiểm tra trước khi parseInt.
  // Giả sử VnpayIpnQueryDto định nghĩa vnp_Amount là string và bắt buộc.
  const amount = parseInt(query.vnp_Amount, 10) / 100;

  this.logger.log(`[handleVnpayIPN] Received for Order ID: ${orderId}, Received Hash: ${receivedSecureHash}`);
  this.logger.log(`[handleVnpayIPN] Full IPN Query: ${JSON.stringify(query)}`);


  // Sắp xếp các tham số không bao gồm vnp_SecureHash
  const sortedParamsToSign = this.sortObject(paramsWithoutHash);
  const signData = new URLSearchParams(sortedParamsToSign).toString();
  this.logger.log(`[handleVnpayIPN] Data for signing (Order ID: ${orderId}): ${signData}`);

  // Tạo checksum mới
  const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
  const calculatedSignedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  this.logger.log(`[handleVnpayIPN] Calculated Hash (Order ID: ${orderId}): ${calculatedSignedHash}`);

  try {
    // 1. Kiểm tra checksum
    if (receivedSecureHash !== calculatedSignedHash) {
      this.logger.error(`[handleVnpayIPN] IPN Checksum FAILED for Order ID: ${orderId}. Received: ${receivedSecureHash}, Calculated: ${calculatedSignedHash}`);
      return { RspCode: '97', Message: 'Invalid Checksum' }; // Mã lỗi VNPay: Sai chữ ký
    }
    this.logger.log(`[handleVnpayIPN] IPN Checksum VALID for Order ID: ${orderId}.`);

    // === PHẦN TƯƠNG TÁC VỚI ORDER SERVICE ===
    // 2. Kiểm tra Order ID có tồn tại và lấy thông tin đơn hàng
    this.logger.log(`[handleVnpayIPN] Checking Order existence and details for Order ID: ${orderId}...`);
    // TODO: Thay thế bằng logic gọi Order Service thực tế
    // const orderDetails = await this.orderServiceClient.send('find_order_by_id', { orderId }).toPromise();
    const orderDetails = { // Dữ liệu giả định cho mục đích test
      exists: true,
      currentStatus: OrderStatus.PENDING, // Trạng thái hiện tại của đơn hàng trong DB của bạn
      totalAmount: amount, // Số tiền của đơn hàng trong DB của bạn
    };

    if (!orderDetails || !orderDetails.exists) {
      this.logger.error(`[handleVnpayIPN] IPN Order ID not found via Order Service: ${orderId}`);
      return { RspCode: '01', Message: 'Order not found' }; // Mã lỗi VNPay: Đơn hàng không tồn tại
    }
    this.logger.log(`[handleVnpayIPN] IPN Order ID ${orderId} found. Current DB Status: ${orderDetails.currentStatus}, DB Amount: ${orderDetails.totalAmount}`);

    // 3. Kiểm tra số tiền
    if (orderDetails.totalAmount !== amount) {
      this.logger.error(`[handleVnpayIPN] IPN Invalid amount for Order ID: ${orderId}. Expected (DB): ${orderDetails.totalAmount}, Received (VNPay): ${amount}`);
      return { RspCode: '04', Message: 'Invalid amount' }; // Mã lỗi VNPay: Sai số tiền
    }
    this.logger.log(`[handleVnpayIPN] IPN Amount VALID for Order ID: ${orderId}.`);

    // 4. Kiểm tra trạng thái đơn hàng (tránh xử lý lại nếu đơn hàng đã được xử lý thành công hoặc thất bại trước đó)
    if (orderDetails.currentStatus !== OrderStatus.PENDING) {
      // Nếu đơn hàng đã ở trạng thái PROCESSING, COMPLETED, hoặc FAILED, có thể IPN này là một bản gọi lại.
      // VNPay yêu cầu trả về "00" và "Confirm Success" nếu đơn hàng đã được xử lý thành công trước đó.
      // Nếu đơn đã FAILED, việc trả về 00 cũng là một lựa chọn để tránh VNPAY gọi lại liên tục.
      this.logger.warn(`[handleVnpayIPN] Order ID ${orderId} is not in PENDING state (Current DB Status: ${orderDetails.currentStatus}). Potentially already processed.`);
      // Kiểm tra xem rspCode từ IPN có phải là thành công không, để quyết định có nên trả về '00' không
      if (rspCode === '00' && transactionStatus === '00') {
           // Nếu IPN báo thành công và đơn hàng đã ở trạng thái hoàn tất (ví dụ: PROCESSING hoặc COMPLETED)
           if (orderDetails.currentStatus === OrderStatus.PROCESSING || orderDetails.currentStatus === OrderStatus.COMPLETED) {
              this.logger.log(`[handleVnpayIPN] Order ${orderId} already in ${orderDetails.currentStatus}. Confirming success to VNPay.`);
              return { RspCode: '00', Message: 'Confirm Success' };
           }
      }
      // Nếu đơn hàng đã FAILED hoặc IPN báo thất bại cho một đơn hàng không còn PENDING
      // Bạn có thể trả về 02 nếu muốn, nhưng VNPAY có thể thử lại.
      // An toàn hơn là trả 00 nếu đơn hàng đã được xử lý dù kết quả là gì.
      // Tuy nhiên, nếu rspCode không phải '00', trả về mã lỗi tương ứng từ VNPAY có thể hợp lý hơn.
      // Dựa trên tài liệu, nên trả 00 nếu đã xử lý
      this.logger.log(`[handleVnpayIPN] Order ${orderId} is in ${orderDetails.currentStatus}. Considering it handled, returning Confirm Success.`);
      return { RspCode: '00', Message: 'Confirm Success' }; // Hoặc RspCode: '02', Message: 'Order already confirmed/failed'

    }
    this.logger.log(`[handleVnpayIPN] IPN Order ID ${orderId} status is PENDING. Processing payment result...`);
    // === KẾT THÚC PHẦN TƯƠNG TÁC VỚI ORDER SERVICE ===

    // --- Xử lý kết quả giao dịch ---
    let newOrderStatus: OrderStatus;
    if (rspCode === '00' && transactionStatus === '00') {
      newOrderStatus = OrderStatus.PROCESSING; // Giao dịch thành công -> Order chuyển sang Đang xử lý (hoặc COMPLETED tùy luồng)
      this.logger.log(`[handleVnpayIPN] IPN Payment SUCCESS for Order ID: ${orderId}`);
    } else {
      newOrderStatus = OrderStatus.FAILED; // Giao dịch thất bại -> Order chuyển sang Thất bại
      this.logger.warn(`[handleVnpayIPN] IPN Payment FAILED for Order ID: ${orderId}, VNPay RspCode: ${rspCode}, VNPay TxnStatus: ${transactionStatus}`);
    }

    // --- Publish sự kiện `payment_processed` để Order Service cập nhật trạng thái ---
    const eventPayload = {
      orderId: orderId,
      status: newOrderStatus,
      paymentMethod: 'VNPay',
      transactionId: query.vnp_TransactionNo, // Mã giao dịch từ VNPay
      paymentTime: query.vnp_PayDate ? format(new Date(this.parseVnpayDate(query.vnp_PayDate)), 'yyyy-MM-dd HH:mm:ss') : new Date().toISOString(),
      errorCode: rspCode, // Mã lỗi từ VNPay
      errorMessage: this.getVnpayMessage(rspCode!), // Thêm '!' nếu rspCode chắc chắn là string
    };
    const eventPattern = 'payment_processed'; // <<< SỬ DỤNG PATTERN MÀ ORDER SERVICE LẮNG NGHE
    try {
      this.logger.log(`[handleVnpayIPN] Preparing to emit event with PATTERN '${eventPattern}' for Order ID ${orderId}. Payload: ${JSON.stringify(eventPayload)}`);
      this.rabbitClient.emit<string, any>(eventPattern, eventPayload); // <<< EMIT THEO PATTERN
      this.logger.log(`[handleVnpayIPN] Successfully emitted event with PATTERN '${eventPattern}' for Order ID ${orderId}.`);
    } catch (rabbitError) {
      this.logger.error(`[handleVnpayIPN] Error emitting event with PATTERN '${eventPattern}' for Order ID ${orderId}: ${rabbitError.message}`, rabbitError.stack);
    }

    // --- Trả kết quả thành công cho VNPay để họ không gửi IPN lại ---
    // Dù giao dịch thành công hay thất bại, nếu đã xử lý logic, VNPAY yêu cầu trả về 00 (Confirm Success)
    this.logger.log(`[handleVnpayIPN] Responding 'Confirm Success' to VNPay for Order ID: ${orderId} after processing.`);
    return { RspCode: '00', Message: 'Confirm Success' };

  } catch (error) {
    this.logger.error(`[handleVnpayIPN] UNEXPECTED error handling IPN for Order ID: ${orderId}: ${error.message}`, error.stack);
    // Trong trường hợp lỗi không mong muốn, trả lỗi chung cho VNPay
    return { RspCode: '99', Message: 'Unknown error' }; // Mã lỗi VNPay: Lỗi không xác định
  }
}

  // Hàm helper sortObject đã được sửa
  private sortObject(obj: any): any {
    let sorted: any = {};
    let str: string[] = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Key được encode để đảm bảo thứ tự sort đúng,
        // nhưng giá trị của key khi đưa vào mảng str phải là key gốc (chưa encode)
        // để khi lấy ra từ obj[decodedKey] sẽ là giá trị gốc.
        // Cách đơn giản hơn là chỉ cần sort các key gốc.
        str.push(key); // Chỉ cần push key gốc
      }
    }
    str.sort(); // Sort các key gốc

    for (let i = 0; i < str.length; i++) {
      const currentKey = str[i];
      // Lấy giá trị gốc, không encode ở đây
      // new URLSearchParams sẽ tự động encode các giá trị khi .toString()
      sorted[currentKey] = obj[currentKey];
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