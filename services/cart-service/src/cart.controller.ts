// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Put, Body, Param, 
         UseGuards, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './cart/dto/add-item.dto';
import { UpdateItemDto } from './cart/dto/update-item.dto';
import { AuthGuard } from './cart/guards/auth.guard';
import { User } from './cart/decorators/user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCart(@User('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @UseGuards(AuthGuard)
  async addItem(
    @User('userId') userId: string,
    @Body(ValidationPipe) addItemDto: AddItemDto
  ) {
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('items/:productId')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @User('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @UseGuards(AuthGuard)
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