// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Put, Body, Param, Request, ParseUUIDPipe, ValidationPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './cart/dto/add-item.dto';
import { UpdateItemDto } from './cart/dto/update-item.dto';
// Tạm thời chưa dùng Guard, sẽ cần tích hợp sau khi có Gateway/Auth
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Giả sử có guard

@Controller('cart')
// @UseGuards(JwtAuthGuard) // <<< Sẽ áp dụng Guard ở đây sau này
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'cart-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---
    
  // --- Helper Function (Giả định để lấy userId) ---
  // Trong thực tế, userId sẽ lấy từ req.user sau khi JWT được xác thực bởi Guard/Gateway
  private getUserIdFromRequest(req: any): string {
      // Tạm thời trả về một userId cố định để test
      // SAU KHI CÓ AUTH: return req.user.userId;
      return 'test-user-id-123';
  }
  // -------------------------------------------------

  @Get(':userId') // <<< THAY ĐỔI Ở ĐÂY
  async getCart(@Param('userId') userId: string) { // <<< Nhận userId từ param
    // Bỏ hàm helper getUserIdFromRequest ở đây
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(@Request() req, @Body(ValidationPipe) addItemDto: AddItemDto) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('items/:productId')
  async updateItem(
    @Request() req,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ValidationPipe) updateItemDto: UpdateItemDto,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartService.updateItemQuantity(userId, productId, updateItemDto.quantity);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK) // Trả về 200 OK sau khi xóa item thành công
  async removeItem(
    @Request() req,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
     const userId = this.getUserIdFromRequest(req);
     return this.cartService.removeItem(userId, productId);
     // Không cần return gì cụ thể cũng được nếu muốn trả về 204 No Content
     // await this.cartService.removeItem(userId, productId);
  }

  // services/cart-service/src/cart/cart.controller.ts
  @Delete(':userId') // <<< THÊM :userId VÀO ĐÂY
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('userId') userId: string) { // <<< Lấy userId từ Param
    // Bỏ hàm getUserIdFromRequest ở đây
    await this.cartService.clearCart(userId);
  }
}