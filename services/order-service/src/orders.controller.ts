// src/orders/orders.controller.ts (Ví dụ sửa đổi)
import { Controller, Get, Post, Body, Param, Request, ParseUUIDPipe, ValidationPipe, UseGuards, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor, UnauthorizedException, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { OrderDto } from './orders/dto/order.dto'; // Import OrderDto
import { AuthGuard } from './guards/auth.guard'; // Import AuthGuard
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'; // <<<< IMPORT CHO RABBITMQ LISTENER
import { OrderStatus } from './orders/entities/order.entity'; // <<<< IMPORT OrderStatus

// Định nghĩa kiểu dữ liệu cho payload của sự kiện payment_processed
interface PaymentProcessedPayload {
  orderId: string;
  status: OrderStatus; // 'PROCESSING' hoặc 'FAILED'
  paymentMethod: string;
  transactionId?: string;
  paymentTime?: string;
  errorCode?: string;
  errorMessage?: string;
}

@UseInterceptors(ClassSerializerInterceptor) // <<< THÊM INTERCEPTOR
@Controller('orders')

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  private readonly logger = new Logger(OrdersController.name); // <<<< THÊM LOGGER
  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'orders-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---
  
  // --- Helper Function (Giả định để lấy userId) ---
  private getUserIdFromRequest(req: any): string {
    // Tạm thời trả về một userId cố định để test
      // SAU KHI CÓ AUTH: return req.user.userId;
      // return 'test-user-id-123'; // Dùng cùng userId với CartService để test
    if (!req.user?.sub) {
      throw new UnauthorizedException('User not found in request');
    }
    return req.user.sub;
  }

  private extractTokenFromHeader(request: any): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid token type');
    }
    return token;
  }
  // -------------------------------------------------
  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      console.log('Received order request:', {
        user: req.user,
        payload: createOrderDto
      });

      const userId = req.user.sub;
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Token is required');
      }

      return await this.ordersService.createOrder(userId, createOrderDto, token);
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard) 
  async findAll(@Request() req): Promise<OrderDto[]> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findAllForUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard) 
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string): Promise<OrderDto> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findOne(id, userId);
  }
  
  // --- MESSAGE HANDLER CHO RABBITMQ ---
  @MessagePattern('payment_processed') // <<<< LẮNG NGHE SỰ KIỆN 'payment_processed'
  async handlePaymentProcessed(
    @Payload() data: any, // Dùng any để test
    // @Payload() data: PaymentProcessedPayload, // Dữ liệu từ PaymentService
    @Ctx() context: RmqContext, // Context của RabbitMQ (chứa message gốc, channel)
  ): Promise<void> {
    this.logger.log(`[handlePaymentProcessed] ******** CONTROLLER HANDLER ENTERED (RAW DATA) ********`);
    this.logger.log(`[handlePaymentProcessed] Raw Payload: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`[handlePaymentProcessed] Received 'payment_processed' event for Order ID: ${data.orderId}`);
    this.logger.log(`[handlePaymentProcessed] Payload: ${JSON.stringify(data)}`);

    try {
      // Gọi service để cập nhật trạng thái đơn hàng
      await this.ordersService.updateOrderStatus(data.orderId, data.status);
      this.logger.log(`[handlePaymentProcessed] Successfully updated status for Order ID: ${data.orderId} to ${data.status}`);

      // (Quan trọng) Acknowledge a message
      // Điều này báo cho RabbitMQ biết message đã được xử lý thành công và có thể xóa khỏi queue.
      channel.ack(originalMsg);
      this.logger.log(`[handlePaymentProcessed] Message acknowledged for Order ID: ${data.orderId}`);

    } catch (error) {
      this.logger.error(`[handlePaymentProcessed] Error processing 'payment_processed' for Order ID: ${data.orderId}: ${error.message}`, error.stack);
      // Xử lý lỗi:
      // 1. Nack (Not Acknowledge) và re-queue message để thử lại (cẩn thận vòng lặp lỗi):
      //    channel.nack(originalMsg, false, true); // true để re-queue
      // 
      // 2. Nack và không re-queue (gửi vào Dead Letter Exchange nếu có cấu hình):
      channel.nack(originalMsg, false, false); // false để không re-queue
      this.logger.warn(`[handlePaymentProcessed] Message NACKed (not re-queued) for Order ID: ${data.orderId}`);
      // 3. Hoặc chỉ log lỗi và ack message để tránh block queue (tùy chiến lược xử lý lỗi)
      //    channel.ack(originalMsg);
    }
  }
  // --- KẾT THÚC MESSAGE HANDLER --- 
}