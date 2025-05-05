// src/orders/orders.controller.ts (Ví dụ sửa đổi)
import { Controller, Get, Post, Body, Param, Request, ParseUUIDPipe, ValidationPipe, UseGuards, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { OrderDto } from './orders/dto/order.dto'; // Import OrderDto
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor) // <<< THÊM INTERCEPTOR
@Controller('orders')

// @UseGuards(JwtAuthGuard) // <<< Sẽ áp dụng Guard sau
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
      return 'test-user-id-123'; // Dùng cùng userId với CartService để test
  }
  // -------------------------------------------------
  @Post()
  async create(@Request() req, @Body(ValidationPipe) createOrderDto: CreateOrderDto): Promise<OrderDto> { // <<< Sửa kiểu trả về
      const userId = this.getUserIdFromRequest(req);
      // Service vẫn trả về Order Entity, Interceptor sẽ transform
      return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  async findAll(@Request() req): Promise<OrderDto[]> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findAllForUser(userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string): Promise<OrderDto> { // <<< Sửa kiểu trả về
    const userId = this.getUserIdFromRequest(req);
    return this.ordersService.findOne(id, userId);
  }
}