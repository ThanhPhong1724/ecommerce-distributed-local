// src/payment/payment.controller.ts
import { Controller, Post, Body, Get, Query, Req, Res, HttpCode, HttpStatus, ValidationPipe, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { VnpayReturnQueryDto } from './dto/vnpay-query.dto';
import { VnpayIpnQueryDto } from './dto/vnpay-ipn.dto';
import { Request, Response } from 'express'; // Import Request, Response từ express
import { ConfigService } from '@nestjs/config'; // <<<<<< IMPORT CONFIGSERVICE

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,) {}

      // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
    @Get('health') // Route sẽ là /cart/health
    @HttpCode(HttpStatus.OK)
    checkHealth() {
        // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
        return { status: 'ok', service: 'payment-service' }; // Thêm tên service cho dễ nhận biết
    }
    // --- KẾT THÚC HEALTH CHECK ---

    // Endpoint để Frontend gọi tạo URL thanh toán
    @Post('create_payment_url')
    createPaymentUrl(
        @Body(ValidationPipe) createPaymentDto: CreatePaymentUrlDto,
        @Req() req: Request // Lấy request để lấy IP
    ) {
        // Lấy IP và cung cấp giá trị mặc định nếu không tìm thấy
        const ipAddr = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '::1'; // <<< SỬA Ở ĐÂY
        this.logger.log(`Tạo URL thanh toán cho Order: ${createPaymentDto.orderId}, Amount: ${createPaymentDto.amount}, IP: ${ipAddr}`);

        const paymentUrl = this.paymentService.createPaymentUrl(
            ipAddr,
            createPaymentDto.orderId,
            createPaymentDto.amount,
            createPaymentDto.orderDescription,
            createPaymentDto.bankCode,
            createPaymentDto.language
        );
        return { url: paymentUrl }; // Trả về URL cho Frontend redirect
    }

    // Endpoint xử lý Return URL từ VNPay (GET request)
    @Get('vnpay_return')
    vnpayReturn(@Query() query: VnpayReturnQueryDto, @Res() res: Response) {
        this.logger.log(`[vnpayReturn] Called with query: ${JSON.stringify(query)}`);
        try {
            const result = this.paymentService.handleVnpayReturn(query);
            this.logger.log(`[vnpayReturn] Service result: ${JSON.stringify(result)}`);

            const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL'); // <<<<<< LẤY TỪ CONFIGSERVICE
            if (!frontendBaseUrl) {
                this.logger.error('[vnpayReturn] FRONTEND_URL is not defined in config!');
                // Trả về lỗi hoặc redirect đến trang lỗi mặc định nếu FRONTEND_URL không có
                return res.status(500).send('Server configuration error: Frontend URL not set.');
            }

            const frontendReturnUrl = `${frontendBaseUrl}/payment/result?orderId=${result.orderId}&code=${result.code}&message=${encodeURIComponent(result.message)}`;
            this.logger.log(`[vnpayReturn] Redirecting to Frontend: ${frontendReturnUrl}`);
            return res.redirect(frontendReturnUrl);
        } catch (error) {
            this.logger.error(`[vnpayReturn] Error processing: ${error.message}`, error.stack);
            // Trong trường hợp lỗi, redirect về trang lỗi trên frontend
            const frontendBaseUrlOnError = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173'); // Cung cấp giá trị mặc định nếu có thể
            const errorRedirectUrl = `${frontendBaseUrlOnError}/payment/result?orderId=${query.vnp_TxnRef || 'unknown'}&code=99&message=${encodeURIComponent('Lỗi xử lý kết quả thanh toán tại máy chủ')}`;
            this.logger.warn(`[vnpayReturn] Redirecting to error page due to exception: ${errorRedirectUrl}`);
            return res.redirect(errorRedirectUrl);
        }
    }

    // src/payment/payment.controller.ts
    // ... (các imports khác, constructor) ...

    @Get('vnpay_ipn')
    async vnpayIpn(
        @Query() query: VnpayIpnQueryDto, // Nếu bạn chưa thêm ValidationPipe, hãy xem xét.
                                        // Nếu VnpayIpnQueryDto có class-validator decorators, NestJS sẽ tự động validate nếu có global pipe.
        @Res() res: Response
    ) {
        this.logger.log(`[vnpayIpn] --- START --- IPN URL CALLED.`);
        this.logger.log(`[vnpayIpn] Raw query parameters received: ${JSON.stringify(query)}`);

        // Kiểm tra sơ bộ các tham số quan trọng (tùy chọn, vì DTO và ValidationPipe nên làm việc này)
        if (!query.vnp_TxnRef || !query.vnp_ResponseCode || !query.vnp_SecureHash) {
            this.logger.error('[vnpayIpn] Critical IPN parameters missing from query.');
            // VNPAY yêu cầu trả về JSON ngay cả khi lỗi
            return res.status(HttpStatus.BAD_REQUEST).json({ RspCode: '99', Message: 'Invalid IPN parameters: Missing required fields.' });
        }

        try {
            this.logger.log(`[vnpayIpn] Calling paymentService.handleVnpayIPN for Order ID: ${query.vnp_TxnRef}`);
            const result = await this.paymentService.handleVnpayIPN(query);
            
            this.logger.log(`[vnpayIpn] Result from paymentService.handleVnpayIPN: ${JSON.stringify(result)}`);
            this.logger.log(`[vnpayIpn] Responding to VNPay IPN with RspCode: '${result.RspCode}', Message: '${result.Message}'`);

            // Phản hồi lại cho VNPay server theo đúng định dạng yêu cầu
            // Luôn trả về HTTP 200 OK, và nội dung JSON chứa RspCode, Message
            return res.status(HttpStatus.OK).json(result);

        } catch (error) {
            this.logger.error(`[vnpayIpn] UNEXPECTED ERROR in controller while processing IPN for Order ID ${query.vnp_TxnRef || 'UNKNOWN'}: ${error.message}`, error.stack);
            // Trả về lỗi chung cho VNPAY (họ có thể thử lại)
            // Vẫn cố gắng trả về định dạng JSON mà VNPAY mong đợi
            return res.status(HttpStatus.OK).json({ RspCode: '99', Message: 'Internal Server Error during IPN processing.' });
        } finally {
            this.logger.log(`[vnpayIpn] --- END --- IPN URL Processing for Order ID: ${query.vnp_TxnRef || 'UNKNOWN'}.`);
        }
    }

// ... (các hàm khác) ...
}