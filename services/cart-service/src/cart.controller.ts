// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Put, Body, Param, 
         UseGuards, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './cart/dto/add-item.dto';
import { UpdateItemDto } from './cart/dto/update-item.dto';
import { AuthGuard } from './cart/guards/auth.guard';
import { User } from './cart/decorators/user.decorator';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@User('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(
    @User('userId') userId: string,
    @Body(ValidationPipe) addItemDto: AddItemDto
  ) {
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('items/:productId')
  async updateItem(
    @User('userId') userId: string,
    @Param('productId') productId: string,
    @Body(ValidationPipe) updateItemDto: UpdateItemDto
  ) {
    return this.cartService.updateItemQuantity(
      userId, 
      productId, 
      updateItemDto.quantity
    );
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @User('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@User('userId') userId: string) {
    await this.cartService.clearCart(userId);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    return {
      status: 'ok',
      service: 'cart-service'
    };
  }
}