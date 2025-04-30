// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios'; // Đảm bảo HttpModule được import
import { ClientsModule } from '@nestjs/microservices'; // Đảm bảo ClientsModule được import
import { ConfigModule } from '@nestjs/config'; // Đảm bảo ConfigModule được import

@Module({
  imports: [
      HttpModule,
      ConfigModule, // Import ConfigModule nếu chưa global
      // Import lại ClientsModule nếu cần inject ở đây, nhưng đã có trong AppModule
      // ClientsModule.registerAsync(...)
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}