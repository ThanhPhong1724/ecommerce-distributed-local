// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Chỉ định file env
    }),
    CartModule, // Import module cart
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class AppModule {}