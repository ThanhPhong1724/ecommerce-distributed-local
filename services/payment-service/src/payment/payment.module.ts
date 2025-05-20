// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE', // Tên để @Inject() trong PaymentService
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL env var not defined for RABBITMQ_SERVICE client in PaymentModule!');
          }
          console.log('PaymentModule: Registering RABBITMQ_SERVICE client to:', rabbitmqUrl);
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              // Không cần chỉ định 'queue' ở đây cho mục đích emit('pattern', ...)
              // NestJS sẽ tự động tạo một reply queue nếu bạn dùng client.send()
              // queueOptions: { durable: false }, // Có thể để NestJS tự quản lý
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}