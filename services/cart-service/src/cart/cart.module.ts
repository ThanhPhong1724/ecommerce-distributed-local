// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { CartController } from '../cart.controller';
import { CartService } from '../cart.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
    AuthGuard,
  ],
  exports: [CartService]
})
export class CartModule {}