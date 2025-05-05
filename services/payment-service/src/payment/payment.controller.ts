// src/payment/payment.controller.ts
import { Controller, Post, Body, Get, Query, Req, Res, HttpCode, HttpStatus, ValidationPipe, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { VnpayReturnQueryDto } from './dto/vnpay-query.dto';
import { VnpayIpnQueryDto } from './dto/vnpay-ipn.dto';
import { Request, Response } from 'express'; // Import Request, Response từ express

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) {}

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
        this.logger.log('VNPay Return URL called with query:', query);
        const result = this.paymentService.handleVnpayReturn(query);

        // Redirect người dùng về trang kết quả trên Frontend
        // Truyền mã kết quả và orderId qua query params để Frontend hiển thị
        const frontendReturnUrl = `${this.paymentService['configService'].get('FRONTEND_URL')}/payment/result?orderId=${result.orderId}&code=${result.code}&message=${encodeURIComponent(result.message)}`;
        this.logger.log(`Redirecting to Frontend: ${frontendReturnUrl}`);
        return res.redirect(frontendReturnUrl); // Thực hiện redirect
    }

    // Endpoint xử lý IPN từ VNPay (GET request)
    @Get('vnpay_ipn')
    async vnpayIpn(@Query() query: VnpayIpnQueryDto, @Res() res: Response) {
        this.logger.log('VNPay IPN URL called with query:', query);
        const result = await this.paymentService.handleVnpayIPN(query);

        // Phản hồi lại cho VNPay server theo đúng định dạng yêu cầu
        this.logger.log(`Responding to VNPay IPN: ${JSON.stringify(result)}`);
        // Chỉ trả về mã và thông báo, không redirect
        res.status(HttpStatus.OK).json(result);
    }
}