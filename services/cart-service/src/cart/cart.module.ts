// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { CartController } from '../cart.controller';
import { CartService } from '../cart.service';
// Không cần TypeOrmModule ở đây vì dùng Redis

@Module({
  imports: [
    // Không cần TypeOrmModule
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService] // Export nếu service khác cần dùng (vd: OrderService)
})
export class CartModule {}