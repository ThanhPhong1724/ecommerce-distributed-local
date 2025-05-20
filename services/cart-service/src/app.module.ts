// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module'; // Chỉ cần import Module

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CartModule, // <-- Chỉ cần import CartModule ở đây
    // HttpModule, // Chỉ import ở đây nếu AppModule có provider/controller riêng cần HttpService
  ],
  // KHÔNG khai báo Controller/Service của CartModule ở đây
  controllers: [], // Chỉ chứa các controller của riêng AppModule (nếu có)
  providers: [],   // Chỉ chứa các provider của riêng AppModule (nếu có)
})
export class AppModule {}