// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios';
// Import lại các thành phần cần thiết cho ClientsModule
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
      HttpModule, // Giữ lại nếu PaymentService CÓ dùng HttpService (hiện tại thì không)
      ConfigModule, // Giữ lại vì PaymentService inject ConfigService

      // <<< THÊM LẠI PHẦN NÀY >>>
      // Đăng ký RabbitMQ client trong context của PaymentModule
      ClientsModule.registerAsync([
        {
          name: 'RABBITMQ_SERVICE', // Phải khớp với tên dùng trong @Inject
          imports: [ConfigModule], // Factory cần ConfigModule
          useFactory: (configService: ConfigService) => {
            const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
            if (!rabbitmqUrl) {
              throw new Error('RABBITMQ_URL env var not defined!');
            }
            console.log('Payment Module registering RabbitMQ Client to:', rabbitmqUrl); // Log để phân biệt
            return {
              transport: Transport.RMQ,
              options: {
                urls: [rabbitmqUrl],
                queue: 'payments_events', // Đảm bảo tên queue nhất quán
                queueOptions: { durable: true },
              },
            };
          },
          inject: [ConfigService],
        },
      ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  // exports: [PaymentService] // Chỉ cần export nếu module khác import PaymentModule và dùng PaymentService
})
export class PaymentModule {}