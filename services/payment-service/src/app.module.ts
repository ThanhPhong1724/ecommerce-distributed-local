// src/app.module.ts (payment-service)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule, // Nếu PaymentModule hoặc các module con khác cần
    PaymentModule, // PaymentModule sẽ tự quản lý RabbitMQ client của nó
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}