// src/orders/orders.controller.ts (Ví dụ sửa đổi)
import {
  Controller, Get, Post, Patch, Body, Param, Request, ParseUUIDPipe,
  ValidationPipe, UseGuards, HttpCode, HttpStatus, UseInterceptors,
  ClassSerializerInterceptor, UnauthorizedException, Logger, Query // <<< Thêm Query
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { OrderDto } from './orders/dto/order.dto'; // Import OrderDto
import { AuthGuard } from './guards/auth.guard'; // Import AuthGuard
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'; // <<<< IMPORT CHO RABBITMQ LISTENER
import { Order, OrderStatus } from './orders/entities/order.entity'; // <<<< IMPORT OrderStatus
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // <<< Đường dẫn tới Guard
import { AdminGuard } from './guards/admin.guard';   // <<< Đường dẫn tới Guard
import { UpdateOrderAdminDto } from './orders/dto/update-order-admin.dto'; // <<< Tạo DTO này
import { DailyOrderStatsDto, RevenueDataPointDto, DateRangeQueryDto  } from './orders/dto/stats.dto'; // Import DTOs
import { startOfDay, endOfDay, subDays, format, parseISO, isValid } from 'date-fns'; // Thư viện date-fns

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
  async findAll(@Request() req): Promise<Order[]> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findAllForUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard) 
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string): Promise<Order> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findOne(id, userId);
  }
 
  // --- ENDPOINTS MỚI CHO ADMIN ---
  @UseGuards(JwtAuthGuard, AdminGuard) 
  @Get('admin/all') // Route ví dụ: /api/orders/admin/all
  async findAllForAdmin(
    // Thêm các Query param để phân trang, lọc, tìm kiếm sau này
    // @Query('page') page: number = 1,
    // @Query('limit') limit: number = 10,
    // @Query('status') status?: OrderStatus,
    // @Query('search') search?: string,
  ): Promise<Order[]> { // Hoặc một kiểu PagedResponse<Order>
    this.logger.log('Admin request to get all orders');
    return this.ordersService.findAllAdmin(); // <<< Sẽ tạo hàm này trong service
  }

  @UseGuards(JwtAuthGuard, AdminGuard) 
  @Get('admin/:orderId') // Route ví dụ: /api/orders/admin/some-order-id
  async findOneForAdmin(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<Order> {
    this.logger.log(`Admin request to get order details for ID: ${orderId}`);
    return this.ordersService.findOneAdmin(orderId); // <<< Sẽ tạo hàm này trong service
  }
    // --- ENDPOINT ADMIN CẬP NHẬT CHI TIẾT ĐƠN HÀNG ---
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:orderId')
  async updateOrderDetailsByAdmin( // <<< Tên hàm trong controller
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body(ValidationPipe) updateDto: UpdateOrderAdminDto,
  ): Promise<Order> {
    this.logger.log(`Admin request to update details for order ID: ${orderId} with data: ${JSON.stringify(updateDto)}`);
    return this.ordersService.updateOrderDetailsByAdmin(orderId, updateDto); // <<< Gọi hàm service tương ứng
  }
  // --- ADMIN STATS ENDPOINTS (GỘP VÀO ĐÂY) ---
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats/daily-summary') // Route: /api/orders/admin/stats/daily-summary
  async getDailyOrderSummaryForAdmin(): Promise<DailyOrderStatsDto> {
    this.logger.log('API Admin: Get daily order summary');
    return this.ordersService.getDailyOrderSummary();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats/revenue-over-time') // Route: /api/orders/admin/stats/revenue-over-time
  async getRevenueOverTimeForAdmin(
    @Query(ValidationPipe) query: DateRangeQueryDto // Validate query params
  ): Promise<RevenueDataPointDto[]> {
    this.logger.log(`API Admin: Get revenue over time with query: ${JSON.stringify(query)}`);
    return this.ordersService.getRevenueOverTime(query.startDate, query.endDate);
  }
  // --- KẾT THÚC ENDPOINTS ADMIN ---

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
      // await this.ordersService.updateOrderStatus(data.orderId, data.status);
      await this.ordersService.updateOrderStatusAfterPayment(data.orderId, data.status);
      
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